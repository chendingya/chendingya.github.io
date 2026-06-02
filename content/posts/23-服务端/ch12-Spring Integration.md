---
title: 服务端-ch12-Spring Integration
date: 2023-11-23 18:32:34
categories: 服务端开发
tags: springboot
---

# ch12-Spring Integration

## EIP（Enterprise Integration Patterns，企业集成模式）

Enterprise Integration Pattern - 

组成简介：https://www.cnblogs.com/loveis715/p/5185332.html

## Integration Pattern Language 

* https://www.enterpriseintegrationpatterns.com/patterns/messaging/

![image-20231125171335976](ch12-Spring%20Integration/image-20231125171335976.png)

# spring integration 

*  https://spring.io/projects/spring-integration

## 一个简单的集成流（例子）

### 本节课目标

![image-20231125171409341](ch12-Spring%20Integration/image-20231125171409341.png)

### 一个简单的集成流

* 集成流配置 
  *  XML配置 
     *  ![image-20231127212700512](ch12-Spring%20Integration/image-20231127212700512.png)
  *  Java配置 
  *  使用DSL的Java配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-integration</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.integration</groupId>
    <artifactId>spring-integration-file</artifactId>
</dependency>
```

### 消息

![image-20231125171609124](ch12-Spring%20Integration/image-20231125171609124.png)

### 集成流（ integration flow）

![image-20231125171622482](ch12-Spring%20Integration/image-20231125171622482.png)

## 集成流的组件介绍

### 集成流的组件

* Channels（通道） —Pass messages from one element to another. 
* Filters（过滤器） —Conditionally allow messages to pass through the flow based on some criteria. 
* Transformers（转换器） —Change message values and/or convert message payloads from one type to another. 
* Routers（路由器） —Direct messages to one of several channels, typically based on message headers. 
* Splitters（切分器） —Split incoming messages into two or more messages, each sent to different channels. 
*  Aggregators（聚合器） —The opposite of splitters, combining multiple messages coming in from separate channels into a  single message. 
*  Service activators（服务激活器） —Hand a message off to some Java method for processing, and then publish the return  value on an output channel. 
*  Channel adapters（通道适配器） —Connect a channel to some external system or transport. Can either accept input or  write to the external system. 
*  Gateways（网关） —Pass data into an integration flow via an interface.

### 消息通道（Message channels）

* PublishSubscribeChannel 1对多，1个发布多个订阅
*  QueueChannel  FIFO
*  PriorityChannel 优先级队列，不按照FIFO出队
*  RendezvousChannel 
*  DirectChannel（缺省） 
*  ExecutorChannel 
*  FluxMessageChannel

```java
@Bean
public MessageChannel orderChannel() {
	return new PublishSubscribeChannel();
}
```

![image-20231125171737061](ch12-Spring%20Integration/image-20231125171737061.png)

### 过滤器（Filters）

```java
@Filter(inputChannel="numberChannel",
outputChannel="evenNumberChannel")
public boolean evenNumberFilter(Integer number) {
	return number % 2 == 0;
}
```

![image-20231125171800541](ch12-Spring%20Integration/image-20231125171800541.png)

### 路由器（Routers ）

```java
@Bean
@Router(inputChannel="numberChannel")
public AbstractMessageRouter evenOddRouter() {
	return new AbstractMessageRouter() {
		@Override
		protected Collection<MessageChannel>
			determineTargetChannels(Message<?> message) {
		Integer number = (Integer) 				  message.getPayload();
    		if (number % 2 == 0) {
    			return Collections.singleton(evenChannel());
    		}
    	return Collections.singleton(oddChannel());
    	}
	};
}
@Bean
public MessageChannel evenChannel() {
	return new DirectChannel();
}
@Bean
public MessageChannel oddChannel() {
	return new DirectChannel();
}

```

![image-20231127212529939](ch12-Spring%20Integration/image-20231127212529939.png)

### 切分器（Splitters）

```java
public class OrderSplitter {
    public Collection<Object> splitOrderIntoParts(PurchaseOrder po) {
        ArrayList<Object> parts = new ArrayList<>();
        parts.add(po.getBillingInfo());
        parts.add(po.getLineItems());
        return parts;
    }
}
@Bean
@Splitter(inputChannel="poChannel",
outputChannel="splitOrderChannel")
public OrderSplitter orderSplitter() {
	return new OrderSplitter();
}
@Bean
@Router(inputChannel="splitOrderChannel")
public MessageRouter splitOrderRouter() {
    PayloadTypeRouter router = new PayloadTypeRouter();
    router.setChannelMapping(
    BillingInfo.class.getName(), "billingInfoChannel");
    router.setChannelMapping(
    List.class.getName(), "lineItemsChannel");
    return router;
}
```

![image-20231127220931393](ch12-Spring%20Integration/image-20231127220931393.png)

### 服务激活器（Service activators ）

#### MessageHandler实现

- 处理完流就截止

```java
@Bean
@ServiceActivator(inputChannel="someChannel")
public MessageHandler sysoutHandler() {
    return message 
    -> {
    System.out.println("Message payload: " + message.getPayload());
	};
}
```

#### GenericHandler实现

- 有返回值

```java
@Bean
@ServiceActivator(inputChannel="orderChannel",
outputChannel="completeOrder")
public GenericHandler<TacoOrder> orderHandler(
		OrderRepository orderRepo) {
    return (payload, headers) 
    -> {
    return orderRepo.save(payload);
    };
}
```

![image-20231127221146119](ch12-Spring%20Integration/image-20231127221146119.png)

与transfomer的区别

* transfomer：对数据进行转换加工
* 服务激活器：激活另一个服务，可能是存储或者外部的功能

### 网关（Gateways ）

只需要写一个接口。
Gateways 是**应用程序代码和消息系统之间的桥梁**。它们抽象了消息发送和接收的细节，使得应用程序代码可以通过方法调用的方式与消息系统交互，而无需直接使用消息API。这样可以使应用程序代码保持简洁，同时也便于测试。

#### 双向网关

- requets channel 输入
- repley channel 获得返回值（Spring会在这个管道上一直等，同步）

```java
import org.springframework.integration.annotation.MessagingGateway;
import org.springframework.stereotype.Component;
@Component
@MessagingGateway(defaultRequestChannel="inChannel",defaultReplyChannel="outChannel")
public interface UpperCaseGateway {
	String uppercase(String in);
}
@Bean
public IntegrationFlow uppercaseFlow() {
    return IntegrationFlows
    .from("inChannel")
    .<String, String> transform(s 
    -> s.toUpperCase())
    .channel("outChannel")
    .get();
}
```

![image-20231127221226270](ch12-Spring%20Integration/image-20231127221226270.png)

### 通道适配器（Channel adapters）

Adapters 则是用于将**消息从一种格式转换为另一种格式**，或者从一种传输协议转换为另一种传输协议。Inbound把外部系统的消息格式转为spring integration消息，outbound把spring integration消息转为外部系统消息。
例如，JMS适配器可以将JMS消息转换为Spring Integration通用消息，HTTP适配器可以将HTTP请求和响应转换为Spring Integration消息。

```java
@Bean
@InboundChannelAdapter(
poller=@Poller(fixedRate="1000"), channel="numberChannel")
public MessageSource<Integer> numberSource(AtomicInteger source) {
    return () -> {
    return new GenericMessage<>(source.getAndIncrement());
    };
}
@Bean
@InboundChannelAdapter(channel="file-channel",
poller=@Poller(fixedDelay="1000"))
public MessageSource<File> fileReadingMessageSource() {
    FileReadingMessageSource sourceReader = new FileReadingMessageSource();
    sourceReader.setDirectory(new File(INPUT_DIR));
    sourceReader.setFilter(new SimplePatternFileListFilter(FILE_PATTERN));
    return sourceReader;
}
```

![image-20231127221257329](ch12-Spring%20Integration/image-20231127221257329.png)

* poller：多长时间触发一次，每秒触发一个消息的源头

### 通道适配器（DSL定义)

```java
@Bean
public IntegrationFlow someFlow(AtomicInteger integerSource) {
    return IntegrationFlows
    .from(integerSource, "getAndIncrement",
    c -> c.poller(Pollers.fixedRate(1000)))
    ...
    .get();
}
@Bean
public IntegrationFlow fileReaderFlow() {
    return IntegrationFlows
    .from(Files.inboundAdapter(new File(INPUT_DIR))
    .patternFilter(FILE_PATTERN))
    .get();
}
```

## 端点模块（Endpoint modules）

![image-20231130212524762](ch12-Spring%20Integration/image-20231130212524762.png)

#  电子邮件集成流（本节课目标）

## 本节课目标

![image-20231130212602626](ch12-Spring%20Integration/image-20231130212602626.png)

## 电子邮件端点模块

```xml
<dependency>
<groupId>org.springframework.integration</groupId>
    <artifactId>spring-integration-mail</artifactId>
</dependency>
```

## 构建集成流

* TacoOrderEmailIntegrationConfig.java (DSL方式）

![image-20231130212912880](ch12-Spring%20Integration/image-20231130212912880.png)

* adaptor：

  ```java
  package tacos.email;
  
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.integration.dsl.IntegrationFlow;
  import org.springframework.integration.dsl.IntegrationFlows;
  import org.springframework.integration.dsl.Pollers;
  import org.springframework.integration.mail.dsl.Mail;
  
  @Configuration
  public class TacoOrderEmailIntegrationConfig {
    
    @Bean
    public IntegrationFlow tacoOrderEmailFlow(
        EmailProperties emailProps,
        EmailToOrderTransformer emailToOrderTransformer,
        OrderSubmitMessageHandler orderSubmitHandler) {
      //创建集成流
      return IntegrationFlows
          .from(Mail.imapInboundAdapter(emailProps.getImapUrl()),
              e -> e.poller(
                  Pollers.fixedDelay(emailProps.getPollRate())))
          .transform(emailToOrderTransformer)
          .handle(orderSubmitHandler)
          .get();
    } 
  }
  ```

  * transform(emailToOrderTransformer)：邮件的内容转成order对象

transformer

```java
package tacos.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.integration.mail.transformer.AbstractMailMessageTransformer;
import org.springframework.integration.support.AbstractIntegrationMessageBuilder;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.stereotype.Component;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class EmailToOrderTransformer
        extends AbstractMailMessageTransformer<EmailOrder> {

    private static Logger log =
            LoggerFactory.getLogger(EmailToOrderTransformer.class);

    private static final String SUBJECT_KEYWORDS = "TACO ORDER";
    static  private  Map<String, Ingredient> map = new HashMap<String, Ingredient>();

    static {
        map.put("flourTortilla", new Ingredient("FLTO", "Flour Tortilla", Ingredient.Type.WRAP));
        map.put("cornTortilla", new Ingredient("COTO", "Corn Tortilla", Ingredient.Type.WRAP));
        map.put("groundBeef", new Ingredient("GRBF", "Ground Beef", Ingredient.Type.PROTEIN));
        map.put("carnitas", new Ingredient("CARN", "Carnitas", Ingredient.Type.PROTEIN));
        map.put("tomatoes", new Ingredient("TMTO", "Diced Tomatoes", Ingredient.Type.VEGGIES));
        map.put("lettuce", new Ingredient("LETC", "Lettuce", Ingredient.Type.VEGGIES));
        map.put("cheddar", new Ingredient("CHED", "Cheddar", Ingredient.Type.CHEESE));
        map.put("jack", new Ingredient("JACK", "Monterrey Jack", Ingredient.Type.CHEESE));
        map.put("salsa", new Ingredient("SLSA", "Salsa", Ingredient.Type.SAUCE));
        map.put("sourCream", new Ingredient("SRCR", "Sour Cream", Ingredient.Type.SAUCE));
    }
    @Override
    protected AbstractIntegrationMessageBuilder<EmailOrder>
    doTransform(Message mailMessage) throws Exception {
        EmailOrder tacoOrder = processPayload(mailMessage);
        return MessageBuilder.withPayload(tacoOrder);
    }

    private EmailOrder processPayload(Message mailMessage) {
        try {
            String subject = mailMessage.getSubject();
            if (subject.toUpperCase().contains(SUBJECT_KEYWORDS)) {
                String email =
                        ((InternetAddress) mailMessage.getFrom()[0]).getAddress();
                byte[] bytes = new byte[100];
                mailMessage.getInputStream().read(bytes);
                String content = new String(bytes);
                return parseEmailToOrder(email, content);
            }
        } catch (MessagingException e) {
            log.error("MessagingException: {}", e);
        } catch (IOException e) {
            log.error("IOException: {}", e);
        }
        return null;
    }

    private EmailOrder parseEmailToOrder(String email, String content) {
        EmailOrder order = new EmailOrder(email);
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.trim().length() > 0 && line.contains(":")) {
                String[] lineSplit = line.split(":");
                String tacoName = lineSplit[0].trim();
                String ingredients = lineSplit[1].trim();
                String[] ingredientsSplit = ingredients.split(",");
                List<Ingredient> ingredientCodes = new ArrayList<>();
                for (String ingredientName : ingredientsSplit) {
                    String code = ingredientName.trim();
                    if (code != null) {
                        ingredientCodes.add(map.get(code));
                    }
                }

                Taco taco = new Taco(tacoName);
                taco.setIngredients(ingredientCodes);
                order.addTaco(taco);
            }
        }
        return order;
    }
}

```

