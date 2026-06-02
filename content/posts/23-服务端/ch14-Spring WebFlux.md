---
title: 服务端-ch14-Spring WebFlux
date: 2023-12-14 18:32:34
categories: 服务端开发
tags: springboot
---

# ch14-Spring WebFlux

## 异步Web框架的事件轮询(event looping)机制

 用更少的线程处理更多的请求，从而减少线程管理的开销

![image-20231217103350611](ch14-Spring%20WebFlux/image-20231217103350611.png)

## Spring MVC与Spring WebFlux的共性与不同

![image-20231217103402970](ch14-Spring%20WebFlux/image-20231217103402970.png)

## Reactive Microservices With Spring Boot

![image-20231217103422723](ch14-Spring%20WebFlux/image-20231217103422723.png)

### 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 编写反应式控制器

Ingredient：Get、Post

### 端到端反应式栈

![image-20231217103504428](ch14-Spring%20WebFlux/image-20231217103504428.png)

### R2DBC

* 反应式关系型数据库连接（reactive relational database connectivity）

* 是JDBC的替代方案，实现非阻塞的持久化操作 

*  依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-r2dbc</artifactId>
  </dependency>
  
  ```

* H2数据库和驱动

  ```xml
  <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
  </dependency>
  <dependency>
      <groupId>io.r2dbc</groupId>
      <artifactId>r2dbc-h2</artifactId>
      <scope>runtime</scope>
  </dependency>
  
  ```

  

## 使用函数式编程范式来定义控制器

* 使用函数式编程风格来定义endpoints的功能 
*  框架引入了两个基本组件：HandlerFunction 和 RouterFunction 
* HandlerFunction 表示处理接收到的请求并生成响应的函数 
*  RouterFunction 替代了 @RequestMapping 注解。它用于将接收到的请求路由到处理函数

## 函数式编程模型涉及的4个类型 

*  RouterFunction Bean 
* org.springframework.web.reactive.function.server 
  * RequestPredicate，声明要处理的请求类型
  *  RouterFunction，声明如何将请求路由到处理器代码中 
  * ServerRequest，代表一个http请求，包括对请求头和请求体的访问
  *  ServerResponse，代表一个http响应，包括响应头和响应体信息

### 测试反应式控制器 

* 处理器函数使用单独的Bean实现，GreetingHandler 
* WebTestClient

### 反应式消费Rest API 

*  RestTemplate=>WebClient 
* GreetingClient

### 控制器的快速返回 

* /mono 
*  /flux，text/event-stream