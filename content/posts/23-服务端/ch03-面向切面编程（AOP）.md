---

title: 服务端开发-ch03-面向切面编程（AOP）
date: 2023-09-21 18:38:34
categories: 服务端开发
tags: 服务端开发
---

# ch03-面向切面编程（AOP）

课程录屏

[ASIMOV_CHEN的个人空间-ASIMOV_CHEN个人主页-哔哩哔哩视频 (bilibili.com)](https://space.bilibili.com/105137602?spm_id_from=333.1007.0.0)

## Bean注入的三种方法

* 构造方法：构造方法有B对象的接口

* set方法： 

* 私有属性上加atuowired

## Spring的模块组成

![image-20230921190330903](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230921190330903.png)

## 软件编程方法的发展

* 面向过程编程（POP，Procedure Oriented Programming)
* 面向对象编程（OOP，Object Oriented Programming）
* 面向切面编程（AOP，Aspect Oriented Programming）
* 函数式编程（FP， Functional Programming）
* 反应式编程（RP，Reactive Programming

## AOP：Aspect Oriented Programming

![image-20230921190413737](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230921190413737.png)

切入后

![image-20230921190427823](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230921190427823.png)

### 横切关注点（cross-cutting concern）

* 日志：运维关注
* 安全
* 事务 
* 缓存：请求消耗大量时间，缓存可以极大程度减小延迟

#### 可选

* 继承（inheritance）
* 委托（delegation）

### AOP图解

![image-20230921190531208](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230921190531208.png)

### AOP术语 

* 通知（Advice）：切面做什么以及何时做 
* 切点（Pointcut）：何处 ，spring只能在方法的前后切，有的别的框架支持在方法的别的地方切
* 切面（Aspect）：Advice和Pointcut的结合
* 连接点（Join point）：方法、字段修改、构造方法
* 引入（introduction）：引入新的行为和状态（给一个对象动态地增加新的方法或者新的属性）
* 织入（Weaving）：切面应用到目标对象的过程

### 五个通知（Advice）类型 

* @Before
* @After ：无论是正常return还是抛出异常，都算after
* @AfterReturnin：正常结束
* @AfterThrowing ：抛出异常
* @Around：环绕，几种类型的结合，通过一个around把逻辑切到其他四种

### 实例

不能破坏业务代码：concert类不能动，接口的获取和调用也都不能动

**但是需要再perform前后插入一些逻辑：实现一个切面aspect**

concert.java

```java
package concert;

public class Concert implements Performance {
    private String myname = "taozhasoheng";

    public String getMyname() {
        return myname;
    }

    public void setMyname(String myname) {
        this.myname = myname;
    }

    @Override
    public void perform() {
        System.out.println("perform...");
    }

    @Override
    public String toString() {
        return "taozs";
    }
}

```

performance.java接口

```java
package concert;

public interface Performance {
    public void perform();
}
```

配置类concertConfig.java

```java
package concert;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@EnableAspectJAutoProxy //开启AspectJ的自动代理机制
public class ConcertConfig {
    @Bean
    public Performance concert() {
        return new Concert();
    }
//    @Bean
//    public Performance concert2() {
//        return new Concert();
//    }

    @Bean
    public Audience audience() { //定义Audience的bean
        return new Audience();
    }


    @Bean
    public EncoreableIntroducer encoreableIntroducer() {
        return new EncoreableIntroducer();
    }
}
```

创建上下文myAnnotationApp.java

Annotation注解

```java
package app;

import concert.*;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MyAnnotationApp {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(ConcertConfig.class);

        Performance concert = ctx.getBean("concert", Performance.class);
        System.out.println(concert.toString() + "");
        System.out.println(concert.getClass().getName());
        concert.perform();

//        Encoreable concert2 = ctx.getBean("concert", Encoreable.class);
//        concert2.performEncore();
    }
}

```

**切面@Aspect ：audience.java**

**三步走**

#### 1.定义切面

* **java类上加`@Aspect`注解，是一个单独的类**

* before告诉spring这是要在方法执行之前切入的行为
* pointcut是一段文本字符串：execution切点表达式
* concert.Performance.perform( .. ))就是包路径 + 接口 + 调用的方法
* 即希望在实现了performance的对象的perform的所有重载方法上切，参数不限
* *表示返回值也不关心，所有返回值都可以

```java
package concert;

import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect //这是切面
public class Audience {
    @Before("execution(* concert.Performance.perform( .. ))")
    //before告诉spring这是要在方法执行之前切入的行为
    //pointcut是一段文本字符串：execution切点表达式
    //concert.Performance.perform( .. ))就是包路径 + 接口 + 调用的方法
    //即希望在实现了performance的对象的perform的所有重载方法上切，参数不限
    //*表示返回值也不关心，所有返回值都可以
    public void silenceCellPhones() {
        System.out.println("Silencing cell phones");
    }

    //演出前就坐
    @Before("execution(* concert.Performance.perform( .. ))")
    public void takeSeats() {
        System.out.println("Taking seats");
    }

    //演出成功鼓掌
    @AfterReturning("execution(* concert.Performance.perform( .. ))")
    public void applause() {
        System.out.println("CLAP CLAP CLAP!!!");
    }

    //演出失败要求补偿
    @AfterThrowing("execution(* concert.Performance.perform( .. ))")
    public void demandRefund() {
        System.out.println("Demand a refund");
    }
}
```

#### 2.开启AspectJ的自动代理机制

在ConcertConfig.java加上@EnableAspectJAutoProxy

不加注解即是实例化切面，spring也不会自动创建代理对象

#### 3.将定义的切面实例化

concertConfig.java中

在配置类中实例化切面类对应的Bean，或者使用`@Component`

```java
@Bean
public Audience audience() { //定义Audience的bean
	return new Audience();
}
```

### 实现原理

- 切与不切通过`getBean`获得的对象类型并不一样。
- 通过创建**代理**实现
  - JDK本身就具备代理能力
  - 针对该对象的调用都会转到代理对象

![image-20230922110411523](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230922110411523.png)

### 织入

#### 织入时机

* 编译期，需要特殊的编译器 
* 类加载期，需要类加载器的处理 
* 运行期： Spring所采纳的方式，使用代理对象、只支持方法级别的连接点

![image-20230922110411523](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230922110411523.png)

### 引入接口(introduction)

* @DeclareParents

* main 和测试

![image-20230922222013111](ch03-%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%BC%96%E7%A8%8B%EF%BC%88AOP%EF%BC%89/image-20230922222013111.png)

####  引入方式

1. 创建需要增加的接口和实现类
2. 新建一个切面类，加`@Aspect`
3. 在里面定义一个新增实现类的`static`接口，加上`@DeclareParents`注解
4. 实例化切面类Bean

#### 例子

定义切面，**为对象增加新的行为**。Encoreable接口里包含要引入的新的行为的定义。新的行为引入到原有类中的时候，每个类都会实例化一个新的DefaultEncoreable类，一对一。

切面本身是**单实例**的，但是实现新行为的类对应的实例和被切入类是**一对一**的。

![image.png](https://chillcharlie-img.oss-cn-hangzhou.aliyuncs.com/image%2F2023%2F09%2F21%2Ff76b26d26ccfff3dcc22e9fd080b07ea_20230921211603.png)

## 代理对象

### JDK提供的代理对象

* Proxy.newProxyInstance

car.java

```java
package proxy;


public class Car implements IVehicle {
    public void run() {
        System.out.println("Car会跑");
    }

    @Override
    public String toString() {
        return "this is Car{}";
    }
}
```

接口IVehicle.java

```java
package proxy;

public interface IVehicle {
    void run();
}

```

App.java**创建代理实例**

```java
package proxy;

import java.lang.reflect.Proxy;

public class App {
    public static void main(String[] args) {
        IVehicle car = new Car();

        //代理对象的创建
        IVehicle vehicle = (IVehicle) Proxy.newProxyInstance(car.getClass().getClassLoader(), Car.class.getInterfaces(), new VehicalInvacationHandler(car));
        vehicle.run();
    }
}
```

所有对car的调用都赚到VehicalInvacationHandler类中

所有对vehicle的invoke的调用都会转到这个类中的invoke

VehicalInvacationHandler.java

```java
package proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class VehicalInvacationHandler implements InvocationHandler {

    private final IVehicle vehicle;

    public VehicalInvacationHandler(IVehicle vehical) {
        this.vehicle = vehical;
    }

    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

        System.out.println("---------before-------");

        Object invoke = method.invoke(vehicle, args);

        System.out.println("---------after-------");

        return invoke;
    }
}
```

InvocationHandler.java

```java
/*
 * Copyright (c) 1999, 2020, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 */

package java.lang.reflect;

import jdk.internal.reflect.CallerSensitive;
import jdk.internal.reflect.Reflection;

import java.util.Objects;

public interface InvocationHandler {
    @CallerSensitive
    public static Object invokeDefault(Object proxy, Method method, Object... args)
            throws Throwable {
        Objects.requireNonNull(proxy);
        Objects.requireNonNull(method);
        return Proxy.invokeDefault(proxy, method, args, Reflection.getCallerClass());
    }
}
```

## 消除重复切面

audience1.java

@pointcut依附一个空类

* @Before("performance()") 把pointcut做切点表达式

```java
package concert;
import org.aspectj.lang.annotation.*;
@Aspect
public class Audience1 {
    @Pointcut("execution(* concert.Performance.perform( .. ))")
    public void performance() {
    }

    @Before("performance()")
    public void silenceCellPhones() {
        System.out.println("Silencing cell phones");
    }

    @Before("performance()")
    public void takeSeats() {
        System.out.println("Taking seats");
    }

    @AfterReturning("performance()")
    public void applause() {
        System.out.println("CLAP CLAP CLAP!!!");
    }

    @AfterThrowing("performance()")
    public void demandRefund() {
        System.out.println("Demand a refund");
    }
}
```

### 切点表达式

- 可以实现👍
  1. 指定在哪些方法上切入
  2. 获取参数
  3. 限定包路径
  4. 限定bean名称，白名单或黑名单
  5. 限定在特定注解上切入

#### Spring AOP

* @AspectJ注解驱动的切面
* @EnableAspectJAutoProxy //开启AspectJ的自动代理机制

### 定义切面（@Aspect）

* 加注解的普通POJO 
* 定义可重用的切点 
* Around通知 
* 定义参数（CD），测试

## AspectJ 切点指示器（pointcut designator）

* 例子 

```java
@Pointcut( "execution(* soundsystem.CompactDisc.playTrack( int )) " + "&& args(trackNumber) //获取参数 

&& within(soundsystem.*) //限定包路径

&& bean(sgtPeppers) ") //限定bean名称，或者： && !bean(sgtPeppers) 
```

* 另一个例子

```java
@Around("@annotation(innerAuth)") //限定注解 

public Object innerAround(ProceedingJoinPoint point, InnerAuth innerAuth) { ... } 

@InnerAuth

public R register(@RequestBody SysUser sysUser) { ... } 
```



## Around

1. `@annotation`关键字指定**在特定注解上植入**
   - 注解可以自己定义，和Spring无关

- `Around`
  - 需要一个**ProceedingJoinPoint方法参数**
  - 对ProceedingJoinPoint方法的调用实际上就是对切点的调用

```java
@Around("@annotation(innerAuth)") //
限定注解
public Object innerAround(ProceedingJoinPoint point, InnerAuth innerAuth) { ... }

@InnerAuth
public R<Boolean> register(@RequestBody SysUser sysUser){...}
```

## Around实例

audience2.java7

```java
package concert;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class Audience2 {
    @Pointcut("execution(* concert.Performance.perform( .. )) ")
    public void performance() {
    }

    @Around("performance()")
    public void watchPerformance(ProceedingJoinPoint joinPoint) {
        try {
            System.out.println(".Silencing cell phones");
            System.out.println(".Taking seats");
            joinPoint.proceed();
            System.out.println(".CLAP CLAP CLAP!!!");
        } catch (Throwable e) {
            System.out.println(".Demanding a refund");
        }
    }
}
```

在之前之后都可以，需要一个参数

### 实现对返回值的修改

XServiceImpl.java

```java
package annotation;

import org.springframework.stereotype.Service;

@Service("xServiceImpl")
public class XServiceImpl {

    @Append
    public String foo(String val) {
        return val;
    }
}

```

实现切面AppendProcessor.java

**around对返回值进行了处理（添加了东西）**，**将逻辑添加到加了append的方法的前或者后**

Append注解加在被植入的foo上，和要植入的逻辑做一个匹配

```java
package annotation;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
/**
 * Append的注解处理器
 */
@Aspect
@Component
public class AppendProcessor {
    @Around("@annotation(appendAnnotation)")
    public String process(ProceedingJoinPoint joinPoint, Append appendAnnotation) throws Throwable {
        String res = appendAnnotation.word() + " " + joinPoint.proceed() + " " + appendAnnotation.word();
        return res;
    }
}
```

**joinPoint.proceed()：原切点处理完**

**ProceedingJoinPoint joinPoint切点**

Append.java

```java
package annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Append {
    String word() default "***";
}
```

配置类MyConfig

```java
package annotation;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@ComponentScan
@EnableAspectJAutoProxy
public class MyConfig {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(MyConfig.class);

        XServiceImpl xServiceImpl = ctx.getBean("xServiceImpl", XServiceImpl.class);
        System.out.println(xServiceImpl.foo("hello world"));
    }
}

```

## 切面统计实例

BlankDisc实现接口CompactDisc

```java
package soundsystem;

import java.util.List;

public class BlankDisc implements CompactDisc {

    private String title;
    private String artist;
    private List<String> tracks;

    public void setTitle(String title) {
        this.title = title;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public void setTracks(List<String> tracks) {
        this.tracks = tracks;
    }

    public void play() {
        System.out.println("Playing " + title + " by " + artist);
        for (String track : tracks) {
            System.out.println("-Track: " + track);
        }
    }

    public void playTrack(int num) {
        System.out.println("-Track: " + tracks.get(num));
    }

}

```

接口CompactDisc，用户可能经常调用playTrack，想统计每首歌调用了多少次，但是不修改playTrack，统计应该与播放解耦，使用切面实现

```java
package soundsystem;

public interface CompactDisc {
    void play();

    void playTrack(int num);
}

```

配置类TrackCounterConfig

创建了cd

```java
package soundsystem;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableAspectJAutoProxy
public class TrackCounterConfig {
    @Bean
    public CompactDisc sgtPeppers() {
        BlankDisc cd = new BlankDisc();
        cd.setTitle("Sgt. Pepper's Lonely Hearts Club Band");
        cd.setArtist("The Beatles");
        List<String> tracks = new ArrayList<>();
        tracks.add("Sgt. Pepper's Lonely Hearts Club Band");
        tracks.add("With a Little Help from My Friends");
        tracks.add("Lucky in the Sky with Diamonds");
        tracks.add("Getting Better");
        tracks.add("Fixing a Hole");
        tracks.add("testtest");
        tracks.add("abcabc");
        cd.setTracks(tracks);
        return cd;
    }

    @Bean
    public TrackCounter trackCounter() {
        return new TrackCounter();
    }
}
```

统计类TrackCounter

获取被截获方法传入的参数值

```java
package soundsystem;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

import java.util.HashMap;
import java.util.Map;

@Aspect
public class TrackCounter {
    private Map<Integer, Integer> trackCounts = new HashMap<>();

    @Pointcut(
            "execution(* soundsystem.CompactDisc.playTrack( int )) " +
                    "&& args(trackNumber)")
    //通过args截获被截获方法传入的参数值，为其指定一个参数名trackNumber作为trackPlayed依附空方法的参数
    public void trackPlayed(int trackNumber) {
    }

    @Before("trackPlayed(trackNumber)")
    //对pointcut的引用，所以也带了参数值，下面的参数应该与其完全一致
    public void countTrack(int trackNumber) {
        int currentCount = getPlayCount(trackNumber);
        trackCounts.put(trackNumber, currentCount + 1);
    }

    public int getPlayCount(int trackNumber) {
        return trackCounts.containsKey(trackNumber) ? trackCounts.get(trackNumber) : 0;
    }
}
```

测试代码

```java
package soundsystem;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.junit.Assert.assertEquals;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = TrackCounterConfig.class)
public class TrackCounterTest {
    @Autowired
    private CompactDisc cd;

    @Autowired
    private TrackCounter counter;

    @Test
    public void testTrackCounter() {
        cd.playTrack(0);
        cd.playTrack(1);
        cd.playTrack(2);
        cd.playTrack(2);
        cd.playTrack(2);
        cd.playTrack(2);
        cd.playTrack(6);
        cd.playTrack(6);

        assertEquals(1, counter.getPlayCount(0));
        assertEquals(1, counter.getPlayCount(1));
        assertEquals(4, counter.getPlayCount(2));
        assertEquals(0, counter.getPlayCount(3));
        assertEquals(0, counter.getPlayCount(4));
        assertEquals(0, counter.getPlayCount(5));
        assertEquals(2, counter.getPlayCount(6));
    }
}
```
