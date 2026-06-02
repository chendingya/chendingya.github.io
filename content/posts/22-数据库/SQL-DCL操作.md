---
title: SQL-DCL操作
date: 2023-03-18 16:02:34
categories: 数据库
tags: SQL	

---



# SQL-DCL操作

data control language

开发人员操作较少，主要是DBA（Database Administrator 数据库管理员）使用

## DCL-管理用户

#### 查询用户

```mysql
use mysql;
select * from user;
```

#### 创建用户

```mysql
create user '用户名'@'主机名' identified by '密码';
```

* 主机名如果是localhost就只能在本地主机登录
* 如果是%通配符就能在任意主机登录

#### 修改用户密码

```mysql
alter user '用户名'@'主机名' identified with mysql_native_password by '新密码';
```

#### 删除用户

```mysql
drop user '用户名'@'主机名';
```



## DCL-权限控制

* all 所有权限
* select 查询数据
* insert 插入数据
* update 修改数据
* delete 删除数据
* alter 修改表
* drop 删除数据库/表/视图
* create 创建数据库/表

#### 查询权限

```mysql
show grants for '用户名'@'主机名';
```

#### 授予权限

```mysql
grant 权限列表 on 数据库名.表名 to '用户名'@'主机名';
```

#### 撤销权限

```mysql
revoke 权限列表 on 数据库名.表名 from '用户名'@'主机名';
```

