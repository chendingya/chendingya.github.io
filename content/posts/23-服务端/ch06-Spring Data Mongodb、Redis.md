---
title: 服务端-ch06-Spring Data Mongodb、Redis
date: 2023-10-12 18:32:34
categories: 服务端开发
tags: 服务端开发
---

# ch06-Spring Data Mongodb、Redis

## NoSQL  

* NoSQL(Not Only SQL) ，指的是非关系型的数据库 
* 没有声明性查询语言 
* 没有预定义的模式
*  键-值对存储、列存储、文档存储、图形数据库

## MongoDB 

* MongoDB 是由C++语言编写的，是一个基于分布式文件存储的开源数据库系统。 
* 文档存储一般用类似json的格式存储，存储的内容是文档型的。这样也就有机会对某些字段建立索引，实现关系数据库的某些功能

![image-20231013185139876](ch06-Spring%20Data%20Mongodb%E3%80%81Redis/image-20231013185139876.png)

### MongoDB Shell 

* mongosh 
* MongoDB Shell是MongoDB自带的交互式Javascript shell,用来对MongoDB进行操作和管理的交互式环境

### MongoDB 概念 

| SQL术语/概念 | MongoDB术语/概念 | 解释/说明       |
| ------------ | ---------------- | --------------- |
| database     | database         | 数据库          |
| table        | collection       | 数据库表/集合   |
| row          | document         | 数据记录行/文档 |
| column       | field            | 数据字段/域     |

![image-20231013185449105](ch06-Spring%20Data%20Mongodb%E3%80%81Redis/image-20231013185449105.png)

### Spring data mongodb 

1. **添加依赖**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>
    	spring-boot-starter-data-mongodb
    </artifactId>
</dependency>
```

**使用docker（可选）/安装windows程序**

* MongoDB 
* （1）创建网络 docker network create mongo-net 
* （2）启动Server docker run --name my-mongo --network  mongo-net -p 27017:27017 -d mongo:latest 
* （3）客户端访问 docker run -it --network mongo-net --rm  mongo mongosh --host my-mongo

>var idObject =Objectld0)
>idObject.getTimestamp()
>idObject.str
>show dbs
>db
>db.something.insertOne({x:10))
>db.something.find0

2. **添加接口**

IngredientRepository 

```java
package tacos.data;

import org.springframework.data.repository.CrudRepository;

import tacos.Ingredient;

public interface IngredientRepository 
         extends CrudRepository<Ingredient, String> {
  
}

```

3. **添加注解**

Ingredient

* @Document：
* @Id：string类型，可以让spring自动生成id

```java
package tacos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Document
@AllArgsConstructor
@NoArgsConstructor(access=AccessLevel.PRIVATE, force=true)
public class Ingredient {

  @Id
  private String id;
  private String name;
  private Type type;

  public enum Type {
    WRAP, PROTEIN, VEGGIES, CHEESE, SAUCE
  }

}

```

Test中的MongoDBClien

```java
package tacos.client;

import com.mongodb.client.*;
import com.mongodb.client.model.Filters;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class MongoDBClient {
    public static void main(String args[]) {
        try {
            MongoClient mongoClient = MongoClients.create();

            MongoDatabase mongoDatabase = mongoClient.getDatabase("test");

            //有就get返回，无就create mytable
            MongoCollection<Document> collection = mongoDatabase.getCollection("mytable");
            
            //删除满足筛选条件
            collection.deleteMany(Filters.eq("name", "taozs"));

            //插入
            Document document = new Document("name", "taozs").
                    append("age", 18).
                    append("memo", "taozhaosheng");

            List<Document> documents = new ArrayList<>();
            documents.add(document);
            collection.insertMany(documents);

            //删除符合条件的第一个文档
//            collection.deleteOne(Filters.eq("age", 18));

            //删除所有符合条件的文档
//            collection.deleteMany(Filters.eq("age", 18));

            //查询
            FindIterable<Document> findIterable = collection.find();

            MongoCursor<Document> mongoCursor = findIterable.iterator();
            while (mongoCursor.hasNext()) {
                Document doc =mongoCursor.next();
                System.out.println(doc);
                System.out.println(doc.toJson());
            }

            mongoClient.close();

        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }
}

```

4.业务层代码不用做变更：taco也不用加document注解

Taco

```java
package tacos;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class Taco {

  @NotNull
  @Size(min=5, message="Name must be at least 5 characters long")
  private String name;

  private Date createdAt = new Date();

  @Size(min=1, message="You must choose at least 1 ingredient")
  private List<Ingredient> ingredients = new ArrayList<>();
  
  public void addIngredient(Ingredient ingredient) {
    this.ingredients.add(ingredient);
  }

}

```

Credit Card #: 6317758315000646578

基于Spring data

* 数据库连接配置 :	application.yml中可以通过下面的命令更改端口号
  * spring.data.mongodb.uri=mongodb://localhost:27017/test 
* 接口定义 
* 领域类注解
  * org.springframework.data.mongodb.core.mapping.Document



## 工具java-faker 

https://github.com/DiUS/java-faker 

添加依赖

```xml
<dependency>
    <groupId>com.github.javafaker</groupId>
    <artifactId>javafaker</artifactId>
    <version>1.0.2</version>
</dependency>
```

FakerTest

```java
package tacos.perf;

import com.github.javafaker.Faker;
import org.junit.jupiter.api.Test;

import java.util.Locale;

public class FakerTest {

    @Test
    public void fakerTest() {
        Faker faker = new Faker(Locale.CHINA);

        System.out.println(faker.address().streetAddress());
//
//        System.out.println(faker.name().fullName());
//
//        System.out.println(faker.book().title());
//
//        System.out.println(faker.phoneNumber().cellPhone());
//
//        System.out.println(faker.app().name());
//
//        System.out.println(faker.color().name());
//
//        System.out.println(faker.date().birthday());
//
//        System.out.println(faker.idNumber().invalid());
    }
}

```

documenttest

```java
package tacos.perf;

import com.github.javafaker.Faker;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 批量插入数据（Document版本）
 */
public class DocumentTest {

    public static final int BATCH_SIZE = 100;
    public static final int TOTAL_COUNT = 10000;
    public static final int ARRAY_LEN = 5;
    public static final String[] PHONE_TYPE = new String[]{"home", "work", "cell"};

    private static MongoDatabase mongoDatabase;

    @BeforeAll
    static public void beforeClass() {
        MongoClient mongoClient = MongoClients.create();
        mongoDatabase = mongoClient.getDatabase("demo");
    }

    @Test
    public void insertDataDocument() {
        MongoCollection<Document> coll = mongoDatabase.getCollection("Person", Document.class);
        Faker faker = new Faker();
        List<Document> data = new ArrayList<>();
        for (int i = 0; i < TOTAL_COUNT; i++) {
            // 每条数据中含有ARRAY_LEN数量的颜色数组
            List<String> colors = new ArrayList<>();
            for (int j = 0; j < ARRAY_LEN; j++) {
                colors.add(faker.color().name());
            }

            Date bDay = faker.date().birthday();
            int age = (int) ((new Date().getTime() - bDay.getTime()) / 3600 / 24 / 365 / 1000);

            List<Document> phones = new ArrayList<>();
            for (int j = 0; j < PHONE_TYPE.length; j++) {
                Document phone = new Document("type", PHONE_TYPE[j]);
                phone.append("number", faker.phoneNumber().phoneNumber());
                phones.add(phone);
            }
            Document person = new Document();
            person.put("name", faker.name().fullName());
            person.put("address", faker.address().fullAddress());
            person.put("birthday", bDay);
            person.put("favouriteColor", colors);
            person.put("age", age);
            person.put("amount", new BigDecimal(faker.number().numberBetween(10, 100)));
            person.put("phones", phones);
            data.add(person);
            // 使用批量方式插入以提高效率
            if (i % BATCH_SIZE == 0) {
                coll.insertMany(data);
                data.clear();
            }
        }
        if (data.size() > 0) {
            coll.insertMany(data);
        }
        System.out.println(String.format("====%d documents generated!", TOTAL_COUNT));
    }
}

```

##  Redis 

* 下载：https://redis.io/download 
*  key-value的Hash表结构，value是某数据结构 
* 内存数据库（**缓存**）
* 可以集群式部署
* 主从（master/slave）复制 ，主机写，从机并发读
* 数据持久化 
* 注意key、value区分大小写

### Redis 命令 

* redis-server
  * Redis配置，redis.conf 
  * 默认端口号6379
*  redis-cli，客户端程序，redis-cli -h host -p port -a password
  * client list命令，用于查看当前所有连接到服务器的客户端信息，其中包括当前客户端所使用的数据库ID 
  * info命令，可以查看当前数据库的信息，其中包括所使用的内存、键值对数量、客户端连接数等 
  * config get命令，可以查看Redis服务器的配置参数，如：config get maxclients、 config get databases（获取默认的数据库个 数）
  * select 0-15，选择数据库 
  *  flushdb，删除当前数据库中的所有key
  * flushall，删除所有数据库中的key 
* Redis 命令参考：http://doc.redisfans.com/

### Redis数据类型 

* 指的是value类型 
* String 
*  List 
* Hash 
*  Set

在cilent内：

`type`查看value类型
`lrang mylist 0 -1`：查看list内容
`lpush`,`rpush`插入数据
`sadd mysqet 1 2 3 4`：add set
`smember myset`：查看set内容

CartTest

* opsForList()是对列表的操作
* opsForValue()是对单个key-value的操作
* redisTemplate.boundListOps("cart")绑定列表到一个对象

```java
package com.example.demo;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.BoundListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class CartTest {

    /*
     * IMPORTANT: This test class requires that a Redis server be running on
     *            localhost and listening on port 6379 (the default port).
     */

    @Autowired
    private RedisConnectionFactory cf;

    @Autowired
    private RedisTemplate<String, Product> redisTemplate;

    @BeforeEach
    public void setup() {
        redisTemplate.delete("9781617291203");
        redisTemplate.delete("cart");
        redisTemplate.delete("cart1");
        redisTemplate.delete("cart2");
    }

    @Test
    public void workingWithSimpleValues() {
        Product product = new Product();
        product.setSku("9781617291203");
        product.setName("Spring in Action");
        product.setPrice(39.99f);

        //我存入一个key一个value
        redisTemplate.opsForValue().set(product.getSku(), product);

        //返回一个key 一个value
        Product found = redisTemplate.opsForValue().get(product.getSku());
        assertEquals(product.getSku(), found.getSku());
        assertEquals(product.getName(), found.getName());
        assertEquals(product.getPrice(), found.getPrice(), 0.005);
    }

    @Test
    public void workingWithLists() {
        Product product1 = new Product();
        product1.setSku("9781617291203");
        product1.setName("Spring in Action");
        product1.setPrice(39.99f);

        Product product2 = new Product();
        product2.setSku("9781935182436");
        product2.setName("Spring Integration in Action");
        product2.setPrice(49.99f);

        Product product3 = new Product();
        product3.setSku("9781935182955");
        product3.setName("Spring Batch in Action");
        product3.setPrice(49.99f);

        //opsForList()是对列表的操作
        redisTemplate.opsForList().rightPush("cart", product1);
        redisTemplate.opsForList().rightPush("cart", product2);
        redisTemplate.opsForList().rightPush("cart", product3);

        assertEquals(3, redisTemplate.opsForList().size("cart").longValue());

        Product first = redisTemplate.opsForList().leftPop("cart");
        Product last = redisTemplate.opsForList().rightPop("cart");

        assertEquals(product1.getSku(), first.getSku());
        assertEquals(product1.getName(), first.getName());
        assertEquals(product1.getPrice(), first.getPrice(), 0.005);

        assertEquals(product3.getSku(), last.getSku());
        assertEquals(product3.getName(), last.getName());
        assertEquals(product3.getPrice(), last.getPrice(), 0.005);

        assertEquals(1, redisTemplate.opsForList().size("cart").longValue());
    }

    @Test
    public void workingWithLists_range() {
        for (int i = 0; i < 30; i++) {
            Product product = new Product();
            product.setSku("SKU-" + i);
            product.setName("PRODUCT " + i);
            product.setPrice(i + 0.99f);
            redisTemplate.opsForList().rightPush("cart", product);
        }

        assertEquals(30, redisTemplate.opsForList().size("cart").longValue());

        List<Product> products = redisTemplate.opsForList().range("cart", 2, 12);
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            assertEquals("SKU-" + (i + 2), product.getSku());
            assertEquals("PRODUCT " + (i + 2), product.getName());
            assertEquals(i + 2 + 0.99f, product.getPrice(), 0.005);
        }
    }

    @Test
    public void performingOperationsOnSets() {
        Product product = new Product();
        product.setSku("9781617291203");
        product.setName("Spring in Action");
        product.setPrice(39.99f);

        redisTemplate.opsForSet().add("cart", product);
        assertEquals(1, redisTemplate.opsForSet().size("cart").longValue());
    }

    @Test
    public void performingOperationsOnSets_setOperations() {
        for (int i = 0; i < 30; i++) {
            Product product = new Product();
            product.setSku("SKU-" + i);
            product.setName("PRODUCT " + i);
            product.setPrice(i + 0.99f);
            redisTemplate.opsForSet().add("cart1", product);
            if (i % 3 == 0) {
                redisTemplate.opsForSet().add("cart2", product);
            }
        }

        Set<Product> diff = redisTemplate.opsForSet().difference("cart1", "cart2");
        Set<Product> union = redisTemplate.opsForSet().union("cart1", "cart2");
        Set<Product> isect = redisTemplate.opsForSet().intersect("cart1", "cart2");

        assertEquals(20, diff.size());
        assertEquals(30, union.size());
        assertEquals(10, isect.size());

        Product random = redisTemplate.opsForSet().randomMember("cart1");
        // not sure what to assert here...the result will be random
        assertNotNull(random);
    }

    @Test
    public void bindingToAKey() {
        Product product1 = new Product();
        product1.setSku("9781617291203");
        product1.setName("Spring in Action");
        product1.setPrice(39.99f);

        Product product2 = new Product();
        product2.setSku("9781935182436");
        product2.setName("Spring Integration in Action");
        product2.setPrice(49.99f);

        Product product3 = new Product();
        product3.setSku("9781935182955");
        product3.setName("Spring Batch in Action");
        product3.setPrice(49.99f);

        //redisTemplate.boundListOps("cart")绑定列表到一个对象
        BoundListOperations<String, Product> cart = redisTemplate.boundListOps("cart");
        cart.rightPush(product1);
        cart.rightPush(product2);
        cart.rightPush(product3);

        assertEquals(3, cart.size().longValue());

        Product first = cart.leftPop();
        Product last = cart.rightPop();

        assertEquals(product1.getSku(), first.getSku());
        assertEquals(product1.getName(), first.getName());
        assertEquals(product1.getPrice(), first.getPrice(), 0.005);

        assertEquals(product3.getSku(), last.getSku());
        assertEquals(product3.getName(), last.getName());
        assertEquals(product3.getPrice(), last.getPrice(), 0.005);

        assertEquals(1, cart.size().longValue());
    }

    @Test
    public void settingKeyAndValueSerializers() {
        // need a local version so we can tweak the serializer
        RedisTemplate<String, Product> redis = new RedisTemplate<>();
        redis.setConnectionFactory(cf);

        redis.setKeySerializer(new StringRedisSerializer());
        redis.setValueSerializer(new Jackson2JsonRedisSerializer<Product>(Product.class));
        redis.afterPropertiesSet(); // if this were declared as a bean, you wouldn't have to do this

        Product product = new Product();
        product.setSku("9781617291203");
        product.setName("Spring in Action");
        product.setPrice(39.99f);

        redis.opsForValue().set(product.getSku(), product);

        Product found = redis.opsForValue().get(product.getSku());
        assertEquals(product.getSku(), found.getSku());
        assertEquals(product.getName(), found.getName());
        assertEquals(product.getPrice(), found.getPrice(), 0.005);

        //new StringRedisTemplate(cf)一律把value当做string
        StringRedisTemplate stringRedis = new StringRedisTemplate(cf);
        String json = stringRedis.opsForValue().get(product.getSku());
        assertEquals("{\"sku\":\"9781617291203\",\"name\":\"Spring in Action\",\"price\":39.99}", json);
    }
}
```

### Jedis和Lettuce 

*  Jedis 和Lettuce都是连接Redis Server的客户端程序
* RedisConnectionFactory接口，JedisConnectionFactory 
* SpringBoot2.x 后默认使用的不再是Jedis而是lettuce，所以spring-boot-starter-data-redis 依赖了： lettuce-core、spring-data-redis、spring-boot-starter 
*  RedisConnectionFactory接口实现自动生成在上下文中，可直接注入使用

### spring data redis

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 使用RedisTemplate 

* RedisTemplate
* StringRedisTemplate

### RedisTemplate的子API

* 使用简单的值 
  *  opsForValue()----ValueOperations 
  *  set、get 
*  使用List类型的值
  *  opsForList()----ListOperations 
  *  rightPush、leftPop、range
*  在Set上执行操作 
  *  opsForSet()----SetOperations 
  *  add、difference、union、intersect 
*  绑定到某个key上 
  *  boundListOps("cart"）

### 指定序列化器 

* 默认处理：JdkSerializationRedisSerializer，对象需要实现Serializable接口 
*  Jackson2JsonRedisSerializer 
*  StringRedisSerializer

#### JSON序列化

```java
redis.setKeySerializer(new StringRedisSerializer())
redis.setVAlueSerializer(new Jackson2JsonRedisSerializer<Product.class>)
```

1. Key比较简单，可以直接用String序列化
2. 指定Value使用`Jackson2JsonRedisSerializer`进行序列化

对数据存取操作的代码没有影响。

可读性更好。

直接使用**RedisTemplate**获取的Value会经过反序列化，仍然为Java对象

如果想要获取String，可以使用**StringRedisTemplate**读取Value。