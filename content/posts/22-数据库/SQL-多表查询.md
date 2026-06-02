---
title: SQL-多表查询
date: 2023-03-18 16:02:34
categories: 数据库
tags: SQL	

---



# SQL-多表查询

### 多表关系

* 一对多
  * 部门和员工的关系
  * 实现：在多的一方建立外键，指向一方的主键
* 多对多
  * 学生和课程的关系
  * 实现：建立第三张中间表，中间表至少包含两个外键，分别关联两方主键
* 一对一
  * 用户和用户详情的关系
  * 在任意一方加入外键，关联另外一方的主键，并设置外键为唯一的UNIQUE

#### 笛卡尔积

m * n

* 多表查询时需要消除无效的笛卡尔积
* 消除方法为：观察多表之间字段的联系，选择相同或有关联的字段，用where条件where a = b

#### 多表查询的分类

##### 连接查询

* 内连接：相当于查询A、B交集

  * 显式内连接

  * ```mysql
    select 字段列表 from 表1 [inner] join 表2 on 连接条件...;
    ```

  * 隐式内连接：

  * ```mysql
    select 字段列表 from 表1 [别名], 表2 [别名] where 条件...;
    ```

* 外连接：

  * 表1或者表2中含有另一表暂时空缺为null的字段，如果想要查询该字段，需要选择合适的外连接

  * 左外和右外可以通过更改表的顺序相互转变

  * 左外连接：查询左表（表1）所有数据，以及两张表交集数据

  * ```mysql
    select 字段列表 from 表1 left [outer] join 表2 on 条件;
    ```

  * 右外连接：查询右表（表2）所有数据，以及两张表交集数据

  * ```mysql
    select 字段列表 from 表1 right [outer] join 表2 on 条件;
    ```

* 自连接：当前表与自身的连接查询，**<u>自连接必须使用表别名</u>**

~~~mysql
select 字段列表 from 表1 别名1 join 表1 别名2 on 条件...;
~~~

可以使内连接查询，也可以是外连接查询

##### 

#### 联合查询union

将多次查询的结果合并，形成一个新的查询结果集

~~~mysql
select 字段列表 from 表1 ...
union [all]
select 字段列表 from 表2 ...;
~~~

* 可能会有重复的行，<u>需要去重：不加all</u>
* 联合的前提：**<u>select的字段相同（有相同的列数和字段类型）</u>**



#### 子查询

SQL语句中嵌套SELECT语句，称为嵌套查询，又称子查询。

~~~mysql
select * from t1 where column1 = ( select column1 FROM t2 );
~~~

* 子查询外部的语句可以是INSERT /UPDATE/ DELETE / SELECT 的任何一个

* 根据子查询结果不同，分为:

* 标量子查询(子查询[括号内部select]返回结果为单个值，数字或日期等)：最简单

  * ~~~mysql
    查询销售部员工id
    select * from employees where dept_id = (select id from dept where name = '销售部');
    
    查询在“方东白”入职之后的员工信息
    select * from emp where entrydate > (select entrydate from emp where name = '方东白');
    ~~~

* 列子查询(子查询返回结果为一列，可以是多行)

  * in / not in / any / some / all

```mysql
select * from emp where dept_id in (select id from dept where name = ‘销售部’or name = '市场部');
select * from emp where salary > all ( select salary from emp where dept_id = (select id from dept mhere nane= '财务部'))
select * from emp where salary > some ( select salary from emp where dept_id = (select id from dept where name='研发部'));
// 查询“销售部”和“市场部”的所有员工信息  查询“销售部”和“市场部”的部门ID
// 查询比财务部所有人工资都高的员工信息 查询所有财务部人员工资 比财务部所有人工资都高的员工信息
//查询比研发部其中任意一人工资高的员工信息
```

| 操作符 | 描述                                   |
| ------ | -------------------------------------- |
| IN     | 在指定的集合范围之内，多选一           |
| NOT IN | 不在指定的集合范围之内                 |
| ANY    | 子查询返回列表中，有任意一个满足即可   |
| SOME   | 与ANY等同，使用SOME的地方都可以使用ANY |
| ALL    | 子查询返回列表的所有值都必须满足       |

* 行子查询(子查询返回结果为一行，可以为多列)

```mysql
查询与“张无忌”的薪资及直属领导相同的员工信息;
a.查询“张无忌”的薪资及直属领导
b．查询与“张无忌”的薪资及直属领导相同的员工信息;
select * from emp where (salary,managerid) = (select salary, managerid from emp where name = '张无忌');
```

* 表子查询(子查询结果为多行多列)

```mysql
查询与”鹿杖客”，“宋远桥”的职位和薪资相同的员工信恳
a．查询鹿杖客”，“宋远桥”的职位和薪资
b.查询与“鹿杖客”，“宋远桥”的职位和薪资相同的员工信息
select * from emp where (job, salary) in ( select job，salary from emp where name ='鹿杖客' or name ='宋远桥')

查询入职日期是“2006-01-01”之后的员工信息，及其部门信息
a.入职日期是”2086-01-01”之后的员工信息
b．查询这部分员工，对应的部门信息;
select e.*，d.* from (select * from emp where entrydate > '2006-01-01') e left join dept d on e.dept_id = d.id
//left join是因为员工表中有员工部门是null
```

