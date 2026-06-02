---
title: SQL-DML操作
date: 2023-03-18 16:02:34
categories: 数据库
tags: SQL	
---



# SQL-DML操作

data manipulation language 数据操作语言 进行对表中数据记录**增删改**

### 添加数据

##### 指定字段添加数据

```mysql
insert into 表名 {字段名1， 字段名2， ......} values {值1， 值2，......};
```

##### 全部字段添加数据

```mysql
insert into 表名 values {值1， 值2， ......};
```

##### 批量添加数据

```mysql
insert into 表名 {字段名1， 字段名2， ......} values {值1， 值2，......}, {值1， 值2，......},{值1， 值2，......};
insert into 表名 values {值1， 值2，......}，{值1， 值2，......}，{值1， 值2，......}；
```

* 字符串和日期型数据应包含在引号中
* 字段顺序与值的顺序一一对应
* 数据大小应在字段规定范围内

## 修改数据

```mysql
update 表名 set 字段名1=值1， 字段名2=值2， ...[where 条件] ;
```

* where条件如果没有，则修改所有

## 删除数据

```mysql
delete from 表名 [where 条件]
```

* 没有where条件会删除整张表数据
* 不能删除某一个字段的值，用update