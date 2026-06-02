---
title: ch15-ir-backpatch-控制流语句翻译中的地址回填技术
date: 2023-04-07 10:02:34
categories: 编译原理
tags: 编译原理
---



# ch15-ir-backpatch-控制流语句翻译中的地址回填技术

## 使用标签标记跳转目标

![image-20230622145609928](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622145609928.png)

Java Bytecode: 使用**地址值**作为跳转目标

![image-20230622145746213](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622145746213.png)

* 每条指令占据多少字节，第四条指令编号为3，占据了三个字节，下一个指令编号为6
* 地址是一个绝对地址
* 不适用符号化的地址，而是使用实际的绝对地址：处于效率考虑，减少翻译的过程
* 可以用两次扫描来确定地址，但是效率低下

## 如何在一趟扫描中生成跳转目标的地址?

难点：如果我要往前跳，不知道具体地址

选择方案依旧为：让布尔表达式B生成跳转指令

![image-20230622150236158](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622150236158.png)

 **B计算不出 B.false 对应的指令地址，B没有S的信息**

### 回填技术

**标签地址先不填，等父节点S翻译到S1后再回填**

回填 (Backpatching) 技术: 子节点挖坑、祖先节点填坑

* 子节点暂时不指定跳转指令的目标地址 
* 待祖先节点能够确定目标地址时回头填充

父节点通过**综合属性**收集子节点中具有相同目标的跳转指令

![image-20230622152721058](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622152721058.png)

* M唯一的作用就是产生

![image-20230622152852697](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622152852697.png)

* B.truelist就是一个集合，将所有去往B.true的指令收集起来
* makelist是API
* nextinstr自动加一

![image-20230622153252292](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622153252292.png)

* 第一个gen知道是去往B.true所以加入B.truelist
* 第二个gen同理

![image-20230622153519707](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622153519707.png)

* 所有去往B.true的指令的集合就是所有去往B1.false的指令的集合

**帮子节点填充**

![image-20230622153752740](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622153752740.png)

* merge就是把B1.false和B2.false（都是去往B.false）合并起来，赋值给B.falselist
* B2为true，因为短路，所以即是去往B.true

* **backpatch就是把所有去往B1.true的指令集合替换为B2的第一条指令的地址值**
* **M是获取当前指令的下一条指令（B2的第一条指令）的地址**

### 例子

**考试提供生成规则**

x < 100 || (x > 200 &&x != y)

![image-20230622154644961](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622154644961.png)

![image-20230622155219283](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622155219283.png)



![image-20230622155316362](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622155316362.png)

#### 空着的goto由if和while这一类的父节点来填充

![image-20230622155336961](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622155336961.png)

* 引入N，

#### if语句

![image-20230622155449711](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622155449711.png)

* 去往S.next的指令的集合：去B.false的和去S1.next的
* S回填B.truelist，地址为S1的第一条指令

#### if-else语句

![image-20230622155719893](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622155719893.png)

* temp是为了合并三个next
* **N.nextlist里只有一条指令，就是N生成的gen(goto-'')，这一条指令就是去往s.next**
* M1回填B.true，M2回填B.false

#### while语句

![image-20230622155756022](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622155756022.png)

* 第一个gen是往回跳转，所以可以直接填上
* S1.next: 回到B.label:begin

#### 其他顺序语法结构

![image-20230622160637031](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622160637031.png)

![image-20230622160644159](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622160644159.png)

只有 (3) 与 (7) 生成了新的代码, 控制流语句的主要目的是**“控制” 流**（生成goto指令）。

### 例子

![image-20230622160938800](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622160938800.png)

会涉及的语法：

![image-20230622160951386](ch15-ir-backpatch%E6%8E%A7%E5%88%B6%E6%B5%81%E8%AF%AD%E5%8F%A5%E7%BF%BB%E8%AF%91%E4%B8%AD%E7%9A%84%E5%9C%B0%E5%9D%80%E5%9B%9E%E5%A1%AB%E6%8A%80%E6%9C%AF/image-20230622160951386.png)

## 总结

* 为左部非终结符布尔表达式 B 计算综合属性 B.truelist 与 B.falselist 
* 为左部非终结符赋值语句/产生赋值语句的语句 S/L 计算综合属性 S/L.nextlist 
* 并为已能确定目标地址的跳转指令进行**回填** (考虑每个综合属性)