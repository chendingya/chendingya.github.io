---
title: ch14-ir-control-比较复杂的控制流翻译
date: 2023-04-06 10:02:34
categories: 编译原理
tags: 编译原理
---



# ch14-ir-control-比较复杂的控制流翻译

## 如何生成更短、更高效的代码?

![image-20230527195529306](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230527195529306.png)

![image-20230527172334371](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230527172334371.png)

* t3 = true的赋值不是必须的：我只要知道根据bool表达式跳转到哪即可

**直接用布尔表达式改变控制流br**

使用控制流跳转间接表明布尔表达式的值

实现思路：分工 合作

父节点为子节点准备跳转指令的目标标签 

子节点通过继承属性确定跳转目标 

P → S 	S → if (B) S1

* S知道B.true和B.false这两个继承属性

### 具体翻译方案

![image-20230602165059117](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602165059117.png)

* 对于每一个B，都有B.true和B.false这两个继承属性（标签）
* 对于每一个S，都有S.next：当S内部发生控制流跳转，会跳转到哪

#### 每一个产生式的三个继承属性如何生成

![image-20230602165250139](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602165250139.png)

* P.code是综合属性，即S.code
* 可能会有跳转语句跳出S本身，所以需要有一个label：S.code翻译完之后紧接的下一条指令的位置

##### 赋值语句的翻译

代表了表达式的翻译, 包括数组引用

![image-20230602165511532](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602165511532.png)

没有S和B，不需要准备继承属性

### if语句的翻译

![image-20230602165726202](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602165726202.png)

* label加在B.code和S~1~.code之间：作用：当我翻译B的时候，里面可能会有goto语句，如果B为true，就会goto到B.true这个label
* B.true：new label()，新建一个label
* B.false：S.next

![image-20230602172026619](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602172026619.png)

蚂蚁老师的注释：

![image-20230602172406328](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602172406328.png)

代码框架：

![image-20230602172619741](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602172619741.png)

### 更复杂的if-else模式：

![image-20230602172818803](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602172818803.png)

* B.true和B.false生成和放置的位置和之前的if-assign相似
* goto S.next是B.true之后，执行了S~1~.code，不执行S~2~.code，所以跳转到S.next

例子详解：

![image-20230602174248576](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602174248576.png)

* S~11~和S~12~都继承了S~1~的next，S~1~和S~2~都继承了S的next
* S.code是根据上面的生成规则生成的，对应蚂蚁注释里的L1-L4

### while语句的翻译

![image-20230602174407487](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230602174407487.png)

蚂蚁的注释：

![image-20230622140613381](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622140613381.png)

![image-20230622141509300](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622141509300.png)

蚂蚁的注释：

![image-20230622141501782](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622141501782.png)

**考试的时候可能是二分查找之类的**

产生式与语法规则：

![image-20230622141759361](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622141759361.png)

![image-20230622141830570](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622141830570.png)

取反的话跳转方向换一下就行：

![image-20230622141844111](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622141844111.png)

### 短路求值

![image-20230622142051115](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142051115.png)

* B1为true，意味着B为true
* B1为true并且B2为true，整个为true
* B2为false，意味着B1也为false，所以整个为false

![image-20230622142016347](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142016347.png)

* B1为true，意味着还需要看B2
* 如果B1为false，意味着整个为false
* B2决定最后B为true还是false

![image-20230622142003589](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142003589.png)



例子

![image-20230622142430258](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142430258.png)

![image-20230622142500877](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142500877.png)

* 如果x < 100 ，意味着短路
*  如果x > 200，意味着不短路
* 如果x<= 200，意味着短路

#### 命令执行验证：

![image-20230622142815003](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142815003.png)

```
生成中间代码
clang -S -emit-llvm if-boolexpr.c -o if-boolexpr-opt0.ll
生成dot文件
opt -dot-cfg if-boolexpr-opt0.ll
让dot文件画图
dot -Tpdf .main.dot -o if-boolexpr-opt0-cfg.pdf
```

![image-20230622142833550](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622142833550.png)

## ANTLR实现

CodeGenListener.java

```java
package codegen;

import org.antlr.v4.runtime.tree.ParseTreeProperty;

import java.io.FileWriter;
import java.io.IOException;

public class CodeGenListener extends ControlBaseListener {
  private final ParseTreeProperty<String> trueLabel = new ParseTreeProperty<>();
  private final ParseTreeProperty<String> falseLabel = new ParseTreeProperty<>();
  private final ParseTreeProperty<String> nextLabel = new ParseTreeProperty<>();
  private final ParseTreeProperty<String> beginLabel = new ParseTreeProperty<>();
  private final ParseTreeProperty<String> codeProperty = new ParseTreeProperty<>();

  private FileWriter fileWriter;
  private int labelCounter = 1;

  public CodeGenListener(String file) throws IOException {
    fileWriter = new FileWriter(file);
  }

  @Override
  public void enterProg(ControlParser.ProgContext ctx) {
    nextLabel.put(ctx.stat(), getNewLabel());
  }

  @Override
  public void exitProg(ControlParser.ProgContext ctx) {
    String code = String.format("%s%n%s:",
        codeProperty.get(ctx.stat()),
        nextLabel.get(ctx.stat()));

    codeProperty.put(ctx, code);

    dump(codeProperty.get(ctx));
  }

  @Override
  public void exitAssignStat(ControlParser.AssignStatContext ctx) {
    codeProperty.put(ctx, "ASSIGN");
  }

  @Override
  public void enterWhileStat(ControlParser.WhileStatContext ctx) {
    beginLabel.put(ctx, getNewLabel() + "begin");

    trueLabel.put(ctx.bool(), getNewLabel());
    falseLabel.put(ctx.bool(), nextLabel.get(ctx));
    nextLabel.put(ctx.stat(), beginLabel.get(ctx));
  }

  @Override
  public void exitWhileStat(ControlParser.WhileStatContext ctx) {
    String code = String.format("%s:%n%s%n%s:%n%s%n%s",
        //对着规则一行一行翻译
        beginLabel.get(ctx),
        codeProperty.get(ctx.bool()),
        trueLabel.get(ctx.bool()),
        codeProperty.get(ctx.stat()),
        "goto " + beginLabel.get(ctx));

    codeProperty.put(ctx, code);
  }

  @Override
  public void enterIfStat(ControlParser.IfStatContext ctx) {
    trueLabel.put(ctx.bool(), getNewLabel());
    falseLabel.put(ctx.bool(), nextLabel.get(ctx));
    nextLabel.put(ctx.stat(), nextLabel.get(ctx));
  }

  @Override
  public void exitIfStat(ControlParser.IfStatContext ctx) {
    String code = String.format("%s%n%s:%n%s",
        codeProperty.get(ctx.bool()),
        trueLabel.get(ctx.bool()),
        codeProperty.get(ctx.stat()));

    codeProperty.put(ctx, code);
  }

  @Override
  public void enterAndExpr(ControlParser.AndExprContext ctx) {
    trueLabel.put(ctx.lhs, getNewLabel());
    falseLabel.put(ctx.lhs, falseLabel.get(ctx));

    trueLabel.put(ctx.rhs, trueLabel.get(ctx));
    falseLabel.put(ctx.rhs, falseLabel.get(ctx));
  }

  @Override
  public void exitAndExpr(ControlParser.AndExprContext ctx) {
    String code = String.format("%s%n%s:%n%s",
        codeProperty.get(ctx.lhs),
        trueLabel.get(ctx.lhs),
        codeProperty.get(ctx.rhs));

    codeProperty.put(ctx, code);
  }

  @Override
  public void exitOrExpr(ControlParser.OrExprContext ctx) {
    String code = String.format("%s%n%s:%n%s",
        codeProperty.get(ctx.lhs),
        falseLabel.get(ctx.lhs),
        codeProperty.get(ctx.rhs));

    codeProperty.put(ctx, code);
  }

  @Override
  public void enterOrExpr(ControlParser.OrExprContext ctx) {
    trueLabel.put(ctx.lhs, trueLabel.get(ctx));
    falseLabel.put(ctx.lhs, getNewLabel());

    trueLabel.put(ctx.rhs, trueLabel.get(ctx));
    falseLabel.put(ctx.rhs, falseLabel.get(ctx));
  }

  @Override
  public void exitRelExpr(ControlParser.RelExprContext ctx) {
    String code = String.format("if %s goto %s%ngoto %s",
        ctx.getText(),
        trueLabel.get(ctx),
        falseLabel.get(ctx));

    codeProperty.put(ctx, code);
  }

  @Override
  public void exitTrueExpr(ControlParser.TrueExprContext ctx) {
    codeProperty.put(ctx, "goto " + trueLabel.get(ctx));
  }

  @Override
  public void exitFalseExpr(ControlParser.FalseExprContext ctx) {
    codeProperty.put(ctx, "goto " + falseLabel.get(ctx));
  }

  private void dump(String code) {
    try {
      fileWriter.write(code);
      fileWriter.close();
    } catch (IOException ioe) {
      System.err.println(ioe.getMessage() + " : " + code);
    }
  }

  private String getNewLabel() {
    return "L" + labelCounter++;
  }
}
```

死循环

![image-20230622145040712](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622145040712.png)

## 布尔表达式的作用

![image-20230622145434253](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622145434253.png)

![image-20230622145443217](ch14-ir-control-%E6%AF%94%E8%BE%83%E5%A4%8D%E6%9D%82%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81%E7%BF%BB%E8%AF%91/image-20230622145443217.png)