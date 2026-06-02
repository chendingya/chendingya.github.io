---
title: 服务端-ch11-消息中间件(ActiveMQ、RabbitMQ)
date: 2023-11-9 18:32:34
categories: 服务端开发
tags: springboot
---

# ch11-消息中间件(ActiveMQ、RabbitMQ)

#  ActiveMQ

## 同步与异步

![image-20231119172721004](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119172721004.png)

### broker

![image-20231119172732660](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119172732660.png)

* 好处：A与B解耦，broker是消息代理

## 消息中间件

* 消息中间件**主要用于组件之间的解耦**，消息的发送者无需知道消息使用者的存在，反之亦然 
* 常用的消息中间件有：ActiveMQ、RabbitMQ、kafka
* 大的系统中有很多子系统，子系统之间的解耦，使用消息中间件

# 本节课例子

![image-20231119172822031](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119172822031.png)

* postman触发api调用，生成订单

![image-20231122150446072](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231122150446072.png)

## JMS 

* Java 消息服务（Java Message Servcie）
* JMS是一个Java标准，定义了使用消息代理（message broker）的通用API 
* Spring通过基于模板的抽象为JMS功能提供了支持，这个模板就是JmsTemplate

## 消息代理（broker） 

*  Apache ActiveMQ 
* Apache ActiveMQ Artemis，重新实现的下一代ActiveMQ

## IntelliJ IDEA不能下载源代码的问题 

* mvn dependency:sources 
*  翻译插件：Translation 
  * 文档：https://yiiguxing.gitee.io/translation-plugin/#/docs 
* AI助手：Tabnine 
  *  https://plugins.jetbrains.com/plugin/12798-tabnine-ai-codecompletion--chat-in-java-js-ts-python--more

## 直接使用JMS接口发送与接收消息 

* JMS规范：jakarta.jms-api-2.0.3.jar 
*  artemis客户端：artemis-jms-client-2.17.0.jar 
* ConnectionFactory connectionFactory = new ActiveMQConnectionFactory(BROKER_URL, USERNAME, PASSWORD); Connection connection = connectionFactory.createConnection(); connection.start(); Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE); Destination destination = session.createQueue("queue.example");

## 关键概念 

*  javax.jms.Message：TextMessage、ObjectMessage 
* javax.jms.Destination，队列或主题，如：org.apache.activemq.artemis.jms.client.ActiveMQQueue 
  * 3种指定方式： 
    *  application.yml（default-destination） 
    *  @Bean（Destination对象） 
    *  直接String指定

## 配置 

```yml
spring:
    jms:
        template:
        	default-destination: tacocloud.order.queue
    artemis:
    host: localhost
    port: 61616
    user: artemis
    password: artemis
    embedded:
    	enabled: false
```

## 使用JmsTemplate

*  JmsTemplate是Spring对JMS集成支持的核心 
* 发送的两个方法：send、convertAndSend

# ActiveMQ Artemis 

*  https://activemq.apache.org/components/artemis/ 
* 下载路径： https://activemq.apache.org/components/artemis/download/ 
* https://github.com/apache/activemq-artemis/blob/main/docs/user-manual/docker.adoc 
*  ActiveMQ Artemis 是一个优秀的跨平台、高性能、开源的消息代理系统 
*  支持的协议
  * JMS 协议 
  *  AMQP （Advanced Message Queueing Protocol） 
  *  MQTT（Message Queuing Telemetry Transport） 
*  Native 内存模式与 JVM 内存模式 
*  分布式架构 
* 消息持久化

## Docker运行 

* \$ docker run --detach --name mycontainer -p 61616:61616 -p 8161:8161 apache/activemq-artemis:latest-alpine 
* docker logs -f mycontainer 
*  $ docker exec -it mycontainer /var/lib/artemis-instance/bin/artemis shell --user artemis --password  artemis 
*  管理控制台：http://localhost:8161 artemis/artemis

## 控制台

![image-20231119174236452](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119174236452.png)

* 需要先建立个会话的session
* 然后消息会被放入队列queue：先进先出

## 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-artemis</artifactId>
</dependency>
```

## 代码

### 发送方：不适用springboot直接使用java

ArtemisExampleSend

```java
package tacos.messaging;

import org.apache.activemq.artemis.jms.client.ActiveMQConnectionFactory;

import javax.jms.JMSException;
import javax.jms.*;

public class ArtemisExampleSend {
    private static final String BROKER_URL = "tcp://localhost:61616";
    private static final String USERNAME = "artemis";
    private static final String PASSWORD = "artemis";

    public static void main(String[] args) throws JMSException {
        ConnectionFactory connectionFactory = new ActiveMQConnectionFactory(BROKER_URL, USERNAME, PASSWORD);
        Connection connection = connectionFactory.createConnection();
        connection.start();

        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Destination destination = session.createQueue("queue.example");

        MessageProducer messageProducer = session.createProducer(destination);
        TextMessage textMessage = session.createTextMessage();
        textMessage.setText("Hello, Artemis!");

        messageProducer.send(textMessage);
        System.out.println("Message sent successfully!");

        connection.close();
    }
}
```

* import org.apache.activemq.artemis.jms.client.ActiveMQConnectionFactory;  ：jar包
* 运行结果：
  * 终端console输出：Message sent successfully!
  * artemis终端输出：![image-20231119175040257](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119175040257.png)![image-20231119175110771](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119175110771.png)

* destination：jms中所定义的目的地，无论消息是订阅还是队列

### 接收端

ArtemisExampleReceive

```java
package tacos.messaging;

import org.apache.activemq.artemis.jms.client.ActiveMQConnectionFactory;

import javax.jms.*;

public class ArtemisExampleReceive {
    private static final String BROKER_URL = "tcp://localhost:61616";
    private static final String USERNAME = "artemis";
    private static final String PASSWORD = "artemis";

    public static void main(String[] args) throws JMSException {
        ConnectionFactory connectionFactory = new ActiveMQConnectionFactory(BROKER_URL, USERNAME, PASSWORD);
        Connection connection = connectionFactory.createConnection();
        connection.start();

        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Destination destination = session.createQueue("queue.example");

        MessageConsumer messageConsumer = session.createConsumer(destination);
        Message message = messageConsumer.receive();

        if (message instanceof TextMessage) {
            System.out.println("Message received: " + ((TextMessage) message).getText());
        }

        connection.close();
    }
}
```

* message instanceof TextMessage：还有对象类型的消息
* 运行结果：![image-20231119175807286](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119175807286.png)![image-20231119175826498](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231119175826498.png)

### 订单信息

JmsOrderMessagingService

```java
package tacos.messaging;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.stereotype.Service;

import tacos.TacoOrder;

@Service
public class JmsOrderMessagingService implements OrderMessagingService {

  private JmsTemplate jms;

  @Autowired
  public JmsOrderMessagingService(JmsTemplate jms) {
    this.jms = jms;
  }

  @Override
  public void sendOrder(TacoOrder order) {
    jms.convertAndSend("tacocloud.order.queue", order,
        this::addOrderSource);
//    jms.send(new MessageCreator(){
//      @Override
//      public Message createMessage(Session session) throws JMSException {
//        Message message = session.createObjectMessage(order);
//        message.setStringProperty("X_ORDER_SOURCE", "WEB");
//        return message;
//      }
//    });
  }
  
  private Message addOrderSource(Message message) throws JMSException {
    message.setStringProperty("X_ORDER_SOURCE", "WEB");
    return message;
  }
}
```

* 添加依赖之后就可以直接注入JmsTemplate



### 消息转换器（MessageConverter）

* SimpleMessageConverter：实现String与TextMessage的相互转换、字节数组与BytesMessage的相互转换、 Map与MapMessage的相互转换，以及Serializable对象与ObjectMessage的相互转换 
* MappingJackson2MessageConverter：使用Jackson 2 JSON库实现消息与JSON格式的相互转换 
*  TypeId 
*  Message.setStringProperty

![image-20231123131552636](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231123131552636.png)

配置类

```java
package tacos.messaging;

import java.util.HashMap;
import java.util.Map;

import javax.jms.Destination;

import org.apache.activemq.artemis.jms.client.ActiveMQQueue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.support.converter.MappingJackson2MessageConverter;

import tacos.TacoOrder;

@Configuration
public class MessagingConfig {

  @Bean
  public MappingJackson2MessageConverter messageConverter() {
    MappingJackson2MessageConverter messageConverter =
                            new MappingJackson2MessageConverter();
    messageConverter.setTypeIdPropertyName("_typeId");

    Map<String, Class<?>> typeIdMappings = new HashMap<String, Class<?>>();
    typeIdMappings.put("order", TacoOrder.class);
    messageConverter.setTypeIdMappings(typeIdMappings);

    return messageConverter;
  }

  @Bean
  public Destination orderQueue() {
    return new ActiveMQQueue("tacocloud.order.queue");
  }
}
```

### kitchen代码

加上artimes的依赖

### 接收消息：拉取模式（pull model）

接收消息：拉取模式（pull model），JmsTemplate支持 

*  访问：http://localhost:8081/

```java
package tacos.kitchen;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import tacos.TacoOrder;

@Profile({"jms-template", "rabbitmq-template"})
@Controller
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderReceiverController {

  private final OrderReceiver orderReceiver;

  @GetMapping("/receive")
  public String receiveOrder(Model model) {
    TacoOrder order = orderReceiver.receiveOrder();
    if (order != null) {
      model.addAttribute("order", order);
      return "receiveOrder";
    }
    return "noOrder";
  }
}
```

### 接收消息：推送模式（push model）

需要定义消息监听器 

* @JmsListener

# RabbitMQ

RabbitMQ 

* AMQP（Advanced Message Queueing Protocol）
*  https://www.rabbitmq.com/
*  Docker：https://registry.hub.docker.com/_/rabbitmq/ 
* RabbitMQ基础概念详细介绍：https://www.cnblogs.com/williamjie/p/9481774.html

## RabbitMQ概念 

*  ConnectionFactory、Connection、Channel 
*  Exchange：Default、Direct、Topic、Fanout、Headers、Dead letter
*  Queue
* routing key 
*  Binding key

![image-20231123131758138](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231123131758138.png)

## 依赖

代码中在api删除jms依赖，增加rabbitmq依赖

在对应模块中加上amqp依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

## 配置

```yml
spring:
    rabbitmq:
        host: localhost
        port: 5672
        username: guest
        password: guest
        template:
        	exchange: tacocloud.orde
```

## 接收消息：拉取模式（pull model）

* RabbitTemplate支持 
* 访问：http://localhost:8081/

![image-20231123174046590](ch11-%E6%B6%88%E6%81%AF%E4%B8%AD%E9%97%B4%E4%BB%B6(ActiveMQ%E3%80%81RabbitMQ)/image-20231123174046590.png)

## 接收消息：推送模式（push model）

* 需要定义消息监听器

* @RabbitListener