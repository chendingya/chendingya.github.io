---
title: ch12-ir-expr-表达式翻译
date: 2023-04-04 10:02:34
categories: 编译原理
tags: 编译原理
---



# ch12-ir-expr-表达式翻译

## 分工和合作

* **父节点为子节点准备跳转指令的目标标签**

* **子节点通过继承属性确定跳转目标**

P → S 

S → if (B) S1![image-20230516210447611](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230516210447611.png)

* 一部分是B的中间代码，应该由B生成
  * B需要有一个B.code综合属性来表示B节点所生成的对于复合表达式的中间代码
* 一部分是S1的中间代码
  * S1需要有一个S1.code
* S最终拿到的中间代码是由B和S1合作分工，在退出S的时候生成代码

![image-20230516220923086](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230516220923086.png)

* 假设S1的开头为B.true的标签
* B中需要有goto跳转，但是B自己本身是不知道这些L1, L2 标签在哪
* 但是S知道，所以B goto的时候应该跳过S1，到S1后：
  * 当B为true，S会通过**继承属性**B.true告诉B应该跳转到S1的位置
  * 同样，B.false会告诉B应该跳转到B.false：但是B.false在哪S也不知道，P知道
  * ![image-20230516221022961](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230516221022961.png)
  * P知道S.next在哪
  * S知道B.true在哪
* **需要父节点通过继承属性将一些子节点需要知道的信息传递下去**

* 准备：S初始化的时候，B.true和B.false都需要确定下来，然后作为参数传给B；s1.next也需要提前准备好，传给S1

## 实例解释

### 文法

![image-20230517102715247](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517102715247.png)

### 具体的赋值语句

![image-20230517102751516](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517102751516.png)

可以生成数组引用的拓展版

下图在上图的基础上添加了L

![image-20230517102917148](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517102917148.png)

* L是用来生成数组引用

### 控制流语句

![image-20230517103107441](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517103107441.png)

* do while本质上是while的变种

* 布尔表达式的具体形态由下图刻画

![image-20230517103200135](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517103200135.png)

* rel：relation operation关系运算符

以上四张图人为划分了expr表达式的类型

* bool：B：**会需要生成goto这种跳转**
* non-bool：E：不需要生成跳转
* **两种表达式的作用不同，分开来能让中间代码的生成变简单**

### 表达式的中间代码翻译

**例子：a = b + −c**

结果：

![image-20230517105825714](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517105825714.png)

* 综合属性 E.code: 中间代码
* 综合属性 E.addr: 变量名 (包括临时变量)、常量
  * a,b,c就是地址

#### 先画语法分析树

![image-20230517105433166](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517105433166.png)

* 第一行是E2.code
* E.addr = top.get(id.lexeme)：从当前作用域的最顶层拿到id
* E1没有生成code
* 然后是生成E.code，先生成一个临时变量t2来保存
* S.code是把E.code加上生成的表达赋值的code，是第三条

#### LLVM -O0

![image-20230517113346696](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230517113346696.png)

* minus c：
  * 用0 - %6对应的变量，放在%7中

## 数组的引用

声明 : int a\[2][3] 

数组引用 : x = a\[1][2]; a\[1][2] = x 

需要计算 a\[1][2] 相对于数组基地址 a 的偏移地址 

addr(a\[1][2]) = base + 1 × 12 + 2 × 4

![image-20230526171547949](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230526171547949.png)

## 实例：c + a\[i][j]

![image-20230526173312021](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230526173312021.png)

综合属性 L.array(.base) : 数组基地址 (即, 数组名)

**综合属性 L.addr : 计算偏移地址**

![image-20230526173353737](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230526173353737.png)

* 在声明int a\[i][j]就已经处理好a的类型和大小宽度了，已经放入符号表
* 左边红框缺少宽度：L.type.width = 12
* 每往上一层就剥掉一层括号[]，将得到的宽度存入t~1~，t~2~
* t~3~是在做累加，就是需要访问的元素的下标所对应的真实地址

## LLVM中真实的IR

![image-20230526174708008](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230526174708008.png)

* 在IR中，用getelementptr指令GEP做数组下标访问，简化了计算
*  %2的类型是：[2 * [3 * i32]]*
* %8：c
* %9：i，类型为i32，在%10中变成i64
* %12：j
* getelementptr:\<base-type>, \<base-type>* \<base-addr> , [i32 \<index>]+
* \<base-type>：若干个整数下标中的第一个：base type used for the first index：
  * It does not change the pointer type. 不改变
  *  It offsets by the \<base-type>.
  * \<index1>：不是在做访问数组元素，而是在做数组指针的移动，做一个偏移，根据类型的大小 
  * ![image-20230527111740130](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230527111740130.png)
  * 如果第一个index为1，则指针移动到24bytes之后
  * 接下来的下标，每访问一层就脱掉一层
  * 数组下标被称作“聚合式信息”
* GEP不只是用于数组这种聚合数据类型，结构体（作为是多个不同类型元素放在一起）也可以用，可以通过偏移量来访问其中的元素
* %11：先是i64 0，表示访问的是(2, (3, int))类型，指针指着数组开头；接着是i64 %10，即访问i，i为1，指针移动到第一行开头，类型为(3, int)。%11的类型已经是(3, i32)*
* %14同理：符号拓展j，然后访问第一行的最后一个元素，%14的类型已经是i32*了

![image-20230527112636937](ch12-ir-expr-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E7%BF%BB%E8%AF%91/image-20230527112636937.png)

### GEP

GEP provides a way to access arrays and manipulate pointers. 

GEP abstract away details like size of types