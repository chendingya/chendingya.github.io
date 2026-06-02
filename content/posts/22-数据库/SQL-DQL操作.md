---
title: SQL-DQL操作
date: 2023-03-18 16:02:34
categories: 数据库
tags: SQL	

---



# SQL-DQL操作

 data query language

```mysql
select 字段列表
from 表名列表
where 条件列表
group by 分组字段列表
having 分组后条件列表
ordered by 排序字段列表
limit 分页参数
```

### 基本查询

#### 查询多个字段

```mysql
select 字段1，字段2，字段3......from 表名;
select * from 表名;
```

##### 设置别名

```mysql
select 字段1 [as 别名1]， 字段2 [as 别名2] ......from 表名;
```

##### 去除重复记录

```mysql
select distinct 字段列表 from 表名;
```



#### 条件查询 where

```mysql
select 字段列表 from 表名 where 条件列表;
```

* \>  
* \>=  
* \< 
* \<= 
* =
* \<\>或\!=
* between and 包含最大值最小值的某个范围
* in()      在in之后的列表中的值，多选一
* like  占位符     模糊匹配（_匹配单个字符，%匹配任意个字符）
* is null 是null
* and 或 &&    与，多条件同时成立    
* or 或 ||            或者（多条件任意一个成立）
* not 或 ！         非



#### 聚合函数

* count 统计数量
* max
* min
* avg：平均值
* sum

**作用于表中某一列**



#### 分组查询group by

```mysql
select 字段列表 from 表名 [where 条件] group by 分组字段名 [having 分组后过滤条件]
```

* **where和having区别**
  * 执行时间：
    * where：分组之前，不满足where，不参与分组；
    * having：分组之后对结果进行过滤；
  * **判断条件：**
    * **where：不能对聚合函数判断；**
    * **having：可以对聚合函数判断；**
  * **作用对象：**
    * **where：基本表或者视图；**
    * **having：组；**
* <u>**分组查询执行顺序：**where > 聚合函数 > having</u>
* 分组之后，查询字段为聚合函数和分组字段，查询其他字段无任何意义；

**例子**：查询年龄小于45的员工，并根据工作地址分组，获取员工数量大于等于3的工作地址

```mysql
select workaddress，count(*) from employees where age < 45 group by workaddress having count()>= 3;
```

* 年龄>=45的因为where是不参加分组的
* having在分组后对组进行操作、





#### 排序查询order by

```mysql
select 字段列表 from order by 字段1 排序方式1 字段2 排序方式2;
```

* 排序方式：
  * ASC：升序（默认值）
  * DESC：降序
* 注意：如果是多字段排序，当第一个字段值相同时，才会根据第二个字段进行排序



#### 分页查询limit

```mysql
select 字段列表 from 表名 limit 起始索引, 查询记录数;
```

* 起始索引从0开始，起始索引= （查询页码 - 1） *  每页显示记录数；
* 分页查询是方言，mysql中为limit，别的数据库有不同的实现
* 如果查询第一页数据，起始索引可以省略，简写为limi 10



#### 实例

查询性别为男，年龄在20-40岁（含）以内的前5个员工信息，对查询结果按年龄升序排序，年龄相同的按入职时间降序排序

```mysql
select * from employees where gender = '男' and age between 20 and 40 order by age asc, entrydate desc limit 5;
```



#### 执行顺序

##### 编写顺序

* select from
* where
* group by
* having
* order by
* limit

##### 执行顺序

*  from
* where
* group by 和 having
* select
* order by
* limit