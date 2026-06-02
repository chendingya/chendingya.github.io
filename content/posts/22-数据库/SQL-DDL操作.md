---
title: SQL-DDL数据库操作
date: 2023-03-18 16:02:34
categories: 数据库
tags: SQL	

---



# SQL-DDL数据库操作

SQL datagrip连接用户名为root

## DDL-数据库查询

* 查询所有数据库
  * show databases；
* 查询当前操作的数据库
  * select database();
* 创建
  * create database [if not exist] 数据库名 [default 字符集] [collate 排序规则]；
  * utf8mb4
* 删除
  * drop database [if exits] 数据库名;
* 使用
  * use 数据库名;

## DDL-表操作

### 表查询

* 查询当前数据库所有表（需要use进入数据库才可）
  * show tables;
* 查询表结构
  * desc 表名;
* 查询制定表达额建表语句
  * show create table 表名;

### 表创建

* 创建

  ```mysql
  create table 表名{
  
  	字段1 字段1类型 约束1 [comment 字段1注释],
  	...... ,
      字段2 字段2类型 约束2 [comment 字段2注释];	
  
  }[comment 表注释];
  ```

* 如果想要设置字段自动增长，则带关键字 auto_increment

* 如果想要设置主键，则带关键字 primary key

* 约束见“

  [SQL-约束.md]: .\SQL-约束.md	""SQL-约束.md""

  ”

### 表修改

* 添加字段
  * alter table 表名 add 字段名 类型（长度） [comment 注释] [约束];
* 修改数据类型
  * alter table 表名 modify 字段名 新数据类型（长度）;
* 修改字段名和字段类型
  * alter table 表名 change 旧字段名 新字段名 类型（长度）[comment 注释] [约束];
* 修改表名
  * alter table 表名 rename to 新表名;

### 表删除

* 删除字段
  * alter table 表名 drop 字段名;
* 删除表
  * drop table [if exists] 表名;
* 删除指定表，并重新创建该表
  * truncate table 表名;

