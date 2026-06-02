---
title: ch13-ir-control-控制流语句的翻译
date: 2023-04-05 10:02:34
categories: 编译原理
tags: 编译原理
---



# ch13-ir-control-控制流语句的翻译

本讲内容颇有难度, 需要多多思考

虽然有非常简单的讲法, 教材龙书偏偏采用了让初学者望而生畏的讲法。

为什么要 “创造困难”? 

简单的翻译方案会产生大量冗长的代码，选择困难的翻译方案是为了生成更短、更高效的代码



control.g4和bool表达式的文法

![](ch13-ir-control-%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%9A%84%E7%BF%BB%E8%AF%91/image-20230527114721450.png)

主要关注绿框中的控制流语句，assign上节课已经讲过了所以不关注

control.g4

~~~java
grammar Control;

@header {
package codegen;
}

prog : stat ;

stat : ID '=' expr ';'                      # AssignStat
     | 'if' '(' bool ')' '{' ifStat = stat '}' 'else' '{' elseStat = stat '}' # IfElseStat
     | 'if' '(' bool ')' '{' stat '}'       # IfStat
     | 'while' '(' bool ')' '{' stat '}'    # WhileStat
     | 'break' ';'                          # BreakStat
     | first = stat second = stat           # SeqStat
     ;

bool : lhs = expr op = ('>' | '>=' | '==') rhs = expr   # RelExpr
     | op = '!' bool                                    # NotExpr
     | lhs = bool op = '&&' rhs = bool                  # AndExpr
     | lhs = bool op = '||' rhs = bool                  # OrExpr
     | 'true'                                           # TrueExpr
     | 'false'                                          # FalseExpr
     ;

/**
 * Section 6.4.1: grammar for expressions
 *   (array decl and references are not included yet)
 */

expr : '-' expr         # NegExpr
     | expr '*' expr    # MultExpr
     | expr '+' expr    # ADDExpr
     | '(' expr ')'     # ParenExpr
     | ID               # IdExpr
     | INT              # IntExpr
     ;

GT : '>' ;
GE : '>=' ;
EE : '==' ;

ID : [a-z] ;
INT : [0-9] ;
WS : [ \t\r\n]+ -> skip;
~~~



## 一种非常简单的做法

分工合作：每个终结符负责且仅负责自己的翻译中间代码，不越俎代庖

* 为布尔表达式 B 计算逻辑值 （假设最后一条中间代码将结果保存在临时变量t1中）

* if、while 语句根据 B 的结果改变控制流

例如：if (B) S1

结构：

* 先为B~1~生成code，计算真假，将最终逻辑值保存在t~1~

* **if用一个branch语句测试t~1~的真假，为真就跳到b.true，为假就跳转到b.false**
* b.true是一个标签，接着递归的为S~1~生成代码

![](ch13-ir-control-%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%9A%84%E7%BF%BB%E8%AF%91/image-20230527141632950.png)

**B和if/while的作用是不同的！**

### 控制流语句中间代码翻译代码展示：visitor

* 不推荐使用AG属性文法：.g4和java完全混杂，模块性不好

* 不推荐监听器：介绍visitor，visitor的处理更加灵活 ，listener只能在刚进入s或者s的子树全部处理完之后才能做操作(enter和exit)，没有提供在两个子节点之间的时机来处理
* 

CodeGenVisitor.java 

~~~java
package codegen;

import org.antlr.v4.runtime.Token;

import java.io.FileWriter;
import java.io.IOException;
import java.sql.Array;
import java.util.ArrayDeque;
import java.util.Deque;

public class CodeGenVisitor extends ControlBaseVisitor<String> {
  private final Deque<String> breakLabels = new ArrayDeque<>();
  private final FileWriter fileWriter;
  private int tempCounter = 1;//临时变量的数量
  private int labelCounter = 1;//为控制流语句生成label

  public CodeGenVisitor(String file) throws IOException {
    fileWriter = new FileWriter(file);//中间代码需要写入文件
  }

  @Override
  public String visitProg(ControlParser.ProgContext ctx) {
    visit(ctx.stat());

    try {
        //写文件需要先关闭文件，否则写的内容依然缓存在buffer中
      fileWriter.close();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    return null;
  }

  // stat -> break
    // 难点在于嵌套结构的break如何选择最终跳转的label
  @Override
  public String visitBreakStat(ControlParser.BreakStatContext ctx) {
      //无条件跳转到栈顶
    emit("br " + breakLabels.peek());
    return null;
  }

  // stat -> while (bool) { stat }
  @Override
  public String visitWhileStat(ControlParser.WhileStatContext ctx) {
    String beginLabel = getNewLabel("begin");
    emit(beginLabel);

    String bool = visit(ctx.bool());

    String trueLabel = getNewLabel("b.true");
    String falseLabel = getNewLabel("b.false");
    emit("br " + bool + " " + trueLabel + " " + falseLabel);

    emitLabel(trueLabel);
      //label压栈：while的结尾
    breakLabels.push(falseLabel);
      //访问stat
    visit(ctx.stat());
      //label出栈
    breakLabels.pop();
      //true中的无条件跳转指令
    emit("br " + beginLabel);

      //false
    emitLabel(falseLabel);

    return null;
  }

  // stat -> if (bool) { ifStat = stat } else { elseStat = stat}
    // 复杂的if语句
  @Override
  public String visitIfElseStat(ControlParser.IfElseStatContext ctx) {
    String bool = visit(ctx.bool());

    String trueLabel = getNewLabel("b.true");
    String falseLabel = getNewLabel("b.false");
    String endLabel = getNewLabel("b.end");
    emit("br " + bool + " " + trueLabel + " " + falseLabel);

    emitLabel(trueLabel);
    visit(ctx.ifStat);
    emit("br " + endLabel);

    emitLabel(falseLabel);
    visit(ctx.elseStat);

    emitLabel(endLabel);

    return null;
  }

  // stat -> if (bool) { stat }
  // if语句
  @Override
  public String visitIfStat(ControlParser.IfStatContext ctx) {
    String bool = visit(ctx.bool());

      //生成label
    String trueLabel = getNewLabel("b.true");
    String falseLabel = getNewLabel("b.false");
      //选择跳转的label
    emit("br " + bool + " " + trueLabel + " " + falseLabel);

      //为真
    emitLabel(trueLabel);
    visit(ctx.stat());

      //直接跳到false
    emitLabel(falseLabel);

    return null;
  }

  // stat -> first = stat second = stat
  @Override
  public String visitSeqStat(ControlParser.SeqStatContext ctx) {
    visit(ctx.first);
    visit(ctx.second);
    return null;
  }

  // stat -> ID = expr
  @Override
  public String visitAssignStat(ControlParser.AssignStatContext ctx) {
    String expr = visit(ctx.expr());
    emit(ctx.ID().getText() + " = " + expr);
    return null;
  }

  //关系运算符
  // bool -> lhs = exp REL rhs = exp
  @Override
  public String visitRelExpr(ControlParser.RelExprContext ctx) {
      //先为操作数生成中间代码
    String lhs = visit(ctx.lhs);
    String rhs = visit(ctx.rhs);
	
      //根据不同运算符考虑指令
    Token op = ctx.op;
    String cond = switch (op.getType()) {
      case ControlLexer.GT -> "sgt";  // sgt: signed greater than
      case ControlLexer.GE -> "sge";  // sge: signed greater than or equal
      case ControlLexer.EE -> "eq";
      default -> throw new IllegalArgumentException("No such cond: " + op.getText());
    };

    String temp = getNewTemp();
    emit(temp + " = " + "icmp " + cond + " " + lhs + " " + rhs);
    return temp;
  }

  // bool -> lhs = bool && rhs = bool
  @Override
  public String visitAndExpr(ControlParser.AndExprContext ctx) {
    String lhs = visit(ctx.lhs);

      //根据B1是true还是false
    String trueLabel = getNewLabel("b1.true");
    String falseLabel = getNewLabel("b1.false");
    String endLabel = getNewLabel("b1.end");
    emit("br " + lhs + " " + trueLabel + " " + falseLabel);

      //没有短路求值
    emitLabel(trueLabel);
    String rhs = visit(ctx.rhs);
    String temp = getNewTemp();
    emit(temp + " = " + "AND " + lhs + " " + rhs);
      //用endlabel跳过短路求值的路径，temp就是最终的结果
    emit("br " + endLabel);

      //有短路求值
    emitLabel(falseLabel);
      //直接赋值为false
    emit(temp + " = " + "false");

    emitLabel(endLabel);

    return temp;
  }

  // bool -> lhs = bool || rhs = bool
  @Override
  public String visitOrExpr(ControlParser.OrExprContext ctx) {
      //先拿到bool逻辑值
    String lhs = visit(ctx.lhs);

    String trueLabel = getNewLabel("or.true");
    String falseLabel = getNewLabel("or.false");
    String endLabel = getNewLabel("or.end");
    emit("br " + lhs + " " + trueLabel + " " + falseLabel);

    emitLabel(falseLabel);
      
    String rhs = visit(ctx.rhs);
    String temp = getNewTemp();
      //or
    emit(temp + " = OR " + lhs + " " + rhs);
    emit("br " + endLabel);

    emitLabel(trueLabel);
    emit(temp + " = true");

    emitLabel(endLabel);

    return temp;
  }

  // bool -> ! bool
  @Override
  public String visitNotExpr(ControlParser.NotExprContext ctx) {
    String bool = visit(ctx.bool());
    String temp = getNewTemp();
    emit(temp + " = " + "NOT " + bool);
    return temp;
  }

  @Override
  public String visitFalseExpr(ControlParser.FalseExprContext ctx) {
      //生成临时变量保存false
    String temp = getNewTemp();
    emit(temp + " = " + ctx.getText());
    return temp;
  }

  // B -> true
  @Override
  public String visitTrueExpr(ControlParser.TrueExprContext ctx) {
      //生成临时变量保存true
    String temp = getNewTemp();
    emit(temp + " = " + ctx.getText());
    return temp;
  }

    //expr返回id
  @Override
  public String visitIdExpr(ControlParser.IdExprContext ctx) {
    String temp = getNewTemp();
    emit(temp + " = " + ctx.getText());
    return temp;
  }

  @Override
  public String visitIntExpr(ControlParser.IntExprContext ctx) {
    String temp = getNewTemp();
    emit(temp + " = " + ctx.getText());
    return temp;
  }

  private void emitLabel(String label) {
      //生成指令产生label
    try {
      fileWriter.write(label + ":\n");
    } catch (IOException ioe) {
      System.err.println(ioe.getMessage() + " : " + label);
    }
  }

  private void emit(String code) {
      //写文件
    try {
      fileWriter.write(code + '\n');
    } catch (IOException ioe) {
      System.err.println(ioe.getMessage() + " : " + code);
    }
  }

  private String getNewTemp() {
      //给临时变量起名字
    return "t" + tempCounter++;
  }

  private String getNewLabel(String label) {
      //给label取名
    return label + labelCounter++;
  }
}
~~~

关于break的栈保存：

![](ch13-ir-control-%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%9A%84%E7%BF%BB%E8%AF%91/image-20230527170225863.png)

CodeGenVisitorTest.java

~~~java
package codegen;

import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

public class CodeGenVisitorTest {
  private InputStream is = System.in;
  private final String PATH = "src/test/antlr/codegen/control-flow-I/";
  private String srcFile;
  private String codeFile;

  @BeforeMethod
  public void setUp() throws IOException {
    // bool.txt, if.txt, while.txt, break.txt, bool-short-circuit.txt
    // while-if-II.txt, bool-short-circuit-II.txt
    srcFile = "while-if-II";
    is = new FileInputStream(Path.of(PATH + srcFile + ".txt").toFile());
  }

  @Test
  public void testCodeGenVisitor() throws IOException {
    CharStream input = CharStreams.fromStream(is);
    ControlLexer lexer = new ControlLexer(input);
    CommonTokenStream tokens = new CommonTokenStream(lexer);

    ControlParser parser = new ControlParser(tokens);
    ParseTree tree = parser.prog();

    codeFile = srcFile + "-code";
    CodeGenVisitor cg = new CodeGenVisitor(PATH + codeFile + ".txt");
    cg.visit(tree);
  }
}
~~~

## 短路求值

B -> B~1~ && B~2~：

如果B~1~为false，则正常生成中间代码，但是B~2~不用判断真假，B.value = false，绕过B~2~

修改visitAndExpr

可以自行尝试or的短路求值

### 直接用布尔表达式改变控制流：比较复杂

（使用控制流跳转间接表名布尔表达式的值）