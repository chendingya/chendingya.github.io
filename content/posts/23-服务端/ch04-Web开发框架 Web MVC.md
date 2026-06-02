---
title: 服务端-ch04-Web开发框架 Web MVC
date: 2023-10-02 10:02:34
categories: 服务端开发
tags: 服务端开发
---

# ch04-Web开发框架 Web MVC

## Spring MVC👍

* model-view-controller 
* 模型（model）：存储内容，指数据、领域类
* 视图（view）：显示内容
* 控制器（controller）：处理用户输入

![image-20231001183842428](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231001183842428.png)

### 领域类

![image-20231002102832477](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231002102832477.png)

##  ModelAttribute

- ```
  @ModelAttribute(name = <key>)
  ```

  - 注解返回值为`value`

- 方法被Spring自动调用

### 方法级别

```
@ModelAttribute("attributeName")
public SomeObject methodName() {
    // 创建并返回 SomeObject 对象
}
```

方法的返回值将被添加到模型中，并使用指定的属性名作为key。在控制器处理请求之前，该方法会先被调用。

### 参数级别

```
@GetMapping("/path")
public String methodName(@ModelAttribute("attributeName") SomeObject object) {
    // 处理请求
}
```

在这种写法中，`@ModelAttribute`注解标记在方法的参数上，指定了要从模型中获取的属性的名称。参数将被自动绑定到模型中的相应属性，以便在方法内部使用。

### 默认命名规则

```
@GetMapping("/path")
public String methodName(@ModelAttribute SomeObject object) {
    // 处理请求
}
```

如果没有指定`@ModelAttribute`注解的属性名称，Spring MVC会根据参数类型自动推断属性名称，并将其添加到模型中。
在上面的示例中，`SomeObject`类型的参数将使用类名的首字母小写作为属性名称。

## 实例

TacoOrder.java

```java
package tacos;
import javax.validation.constraints.Digits;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import org.hibernate.validator.constraints.CreditCardNumber;
import java.util.List;
import java.util.ArrayList;
import lombok.Data;

@Data
public class TacoOrder {

  @NotBlank(message="Delivery name is required")
  private String deliveryName;

  @NotBlank(message="Street is required")
  private String deliveryStreet;

  @NotBlank(message="City is required")
  private String deliveryCity;

  @NotBlank(message="State is required")
  private String deliveryState;

  @NotBlank(message="Zip code is required")
  private String deliveryZip;

  @CreditCardNumber(message="Not a valid credit card number")
  private String ccNumber;

  @Pattern(regexp="^(0[1-9]|1[0-2])([\\/])([2-9][0-9])$",
           message="Must be formatted MM/YY")
  private String ccExpiration;

  @Digits(integer=3, fraction=0, message="Invalid CVV")
  private String ccCVV;

  private List<Taco> tacos = new ArrayList<>();

  public void addTaco(Taco taco) {
    this.tacos.add(taco);
  }
}
```

Taco.java

*   @NotNull
    @Size(min=5, message="Name must be at least 5 characters long")：表单规范not null

```java
package tacos;
import java.util.List;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Data;

@Data
public class Taco {

  @NotNull
  @Size(min=5, message="Name must be at least 5 characters long")
  private String name;

  @NotNull
  @Size(min=1, message="You must choose at least 1 ingredient")
  private List<Ingredient> ingredients;
}
```

* @data：等效于code->generator->get/set
* 需要安装lombok插件

枚举类Ingredient.java

```java
package tacos;

import lombok.Data;

@Data
public class Ingredient {
  
  private final String id;
  private final String name;
  private final Type type;
  
  public enum Type {
    WRAP, PROTEIN, VEGGIES, CHEESE, SAUCE
  }
}
```

## 控制器的实现DesignTacoController

* @Slf4j：**lombok的注解**，log对象创建的简化
  * ![image-20231009131543484](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231009131543484.png)

* @RequestMapping("/design") “ ：请求的映射，控制器可以处理以design为前缀的url，如design/a
* @Controller：@Component类似，请求spring实例化该类
* @GetMapping：处理浏览器发出的get请求
  * return design：逻辑视图名，自动匹配真正的视图名，在resource下templates找一个叫design.html的视图，然后渲染视图，**需要添加依赖**

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

* Spring Boot的自动配置功能会发现thymeleaf在类路径中，因此会为Spring MVC自动创建支撑thymeleaf视图的Bean
* thymeleaf与Servlet request属性协作（与spring model解耦）
* @ModelAttribute(name = "tacoOrder")：定义了一个key-value，key为name，value为return，会被在get方法被调用前自动调用
* @SessionAttributes("tacoOrder")：指定tacoorder是session类型的对象：一次会话，多次请求，希望对象在会话过程中一直存在

```java
package tacos.web;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;

import lombok.extern.slf4j.Slf4j;
import tacos.Ingredient;
import tacos.Ingredient.Type;
import tacos.Taco;
import tacos.TacoOrder;

import javax.validation.Valid;
import org.springframework.validation.Errors;

@Slf4j
@Controller
@RequestMapping("/design")
@SessionAttributes("tacoOrder")
public class DesignTacoController {

@ModelAttribute
public void addIngredientsToModel(Model model) {
    //model就是数据，往模型中添加数据就可以使用这种方式
	List<Ingredient> ingredients = Arrays.asList(
        //以下皆为配料
	  new Ingredient("FLTO", "Flour Tortilla", Type.WRAP),
	  new Ingredient("COTO", "Corn Tortilla", Type.WRAP),
	  new Ingredient("GRBF", "Ground Beef", Type.PROTEIN),
	  new Ingredient("CARN", "Carnitas", Type.PROTEIN),
	  new Ingredient("TMTO", "Diced Tomatoes", Type.VEGGIES),
	  new Ingredient("LETC", "Lettuce", Type.VEGGIES),
	  new Ingredient("CHED", "Cheddar", Type.CHEESE),
	  new Ingredient("JACK", "Monterrey Jack", Type.CHEESE),
	  new Ingredient("SLSA", "Salsa", Type.SAUCE),
	  new Ingredient("SRCR", "Sour Cream", Type.SAUCE)
	);

	Type[] types = Ingredient.Type.values();
	for (Type type : types) {
        //针对model注入属性key-value，key为配料的类型，value为方法
	  model.addAttribute(type.toString().toLowerCase(),
	      filterByType(ingredients, type));
	}
  }

    //定义了一个key-value，key为name，value为return
  @ModelAttribute(name = "tacoOrder")
  public TacoOrder order() {
    return new TacoOrder();
  }

  @ModelAttribute(name = "taco")
  public Taco taco() {
    return new Taco();
  }

  @GetMapping
  public String showDesignForm() {
    return "design";
  }

/*
  @PostMapping
  public String processTaco(Taco taco,
  			@ModelAttribute TacoOrder tacoOrder) {
    tacoOrder.addTaco(taco);
    log.info("Processing taco: {}", taco);

    return "redirect:/orders/current";
  }
 */

    //传入tacoOrder对象	
  @PostMapping
  public String processTaco(
		  @Valid Taco taco, Errors errors,
		  @ModelAttribute TacoOrder tacoOrder) {

    if (errors.hasErrors()) {
      return "design";
    }

    tacoOrder.addTaco(taco);
    log.info("Processing taco: {}", taco);

    return "redirect:/orders/current";
  }

  private Iterable<Ingredient> filterByType(
      //迭代器其实就是列表，每一个列表就是配料
      List<Ingredient> ingredients, Type type) {
    return ingredients
              .stream()
              .filter(x -> x.getType().equals(type))
              .collect(Collectors.toList());
  }
}
```

design.html

```html
<!-- tag::all[] -->
<!-- tag::head[] -->
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org">
  <head>
    <title>Taco Cloud</title>
    <link rel="stylesheet" th:href="@{/styles.css}" />
  </head>

  <body>
    <h1>Design your taco!</h1>
    <img th:src="@{/images/TacoCloud.png}"/>

<!-- tag::formTag[] -->
    <form method="POST" th:object="${taco}">
    <!-- end::all[] -->

    <span class="validationError"
          th:if="${#fields.hasErrors('ingredients')}"
          th:errors="*{ingredients}">Ingredient Error</span>

    <!-- tag::all[] -->
    <div class="grid">
<!-- end::formTag[] -->
<!-- end::head[] -->
      <div class="ingredient-group" id="wraps">
<!-- tag::designateWrap[] -->
      <h3>Designate your wrap:</h3>
      <div th:each="ingredient : ${wrap}">
        <input th:field="*{ingredients}" type="checkbox" 
               th:value="${ingredient.id}"/>
        <span th:text="${ingredient.name}">INGREDIENT</span><br/>
      </div>
<!-- end::designateWrap[] -->
      </div>

	  <div class="ingredient-group" id="proteins">
      <h3>Pick your protein:</h3>
      <div th:each="ingredient : ${protein}">
        <input th:field="*{ingredients}" type="checkbox" 
               th:value="${ingredient.id}"/>
        <span th:text="${ingredient.name}">INGREDIENT</span><br/>
      </div>
      </div>

	  <div class="ingredient-group" id="cheeses">
      <h3>Choose your cheese:</h3>
      <div th:each="ingredient : ${cheese}">
        <input th:field="*{ingredients}" type="checkbox" 
               th:value="${ingredient.id}"/>
        <span th:text="${ingredient.name}">INGREDIENT</span><br/>
      </div>
      </div>

	  <div class="ingredient-group" id="veggies">
      <h3>Determine your veggies:</h3>
      <div th:each="ingredient : ${veggies}">
        <input th:field="*{ingredients}" type="checkbox" 
               th:value="${ingredient.id}"/>
        <span th:text="${ingredient.name}">INGREDIENT</span><br/>
      </div>
      </div>

	  <div class="ingredient-group" id="sauces">
      <h3>Select your sauce:</h3>
      <div th:each="ingredient : ${sauce}">
        <input th:field="*{ingredients}" type="checkbox" 
               th:value="${ingredient.id}"/>
        <span th:text="${ingredient.name}">INGREDIENT</span><br/>
      </div>
      </div>
      </div>

      <div>


      <h3>Name your taco creation:</h3>
      <input type="text" th:field="*{name}"/>
      <!-- end::all[] -->
      <span class="validationError"
            th:if="${#fields.hasErrors('name')}"
            th:errors="*{name}">Name Error</span>
      <!-- tag::all[] -->
      <br/>

      <button>Submit Your Taco</button>
      </div>
<!-- tag::closeFormTag[] -->
    </form>
<!-- end::closeFormTag[] -->
  </body>
</html>
<!-- end::all[] -->
```



OrderController.java

* @RequestMapping("/orders")：处理orders前缀
* @GetMapping("/current")：处理current后缀
* /orders/current
* @Slf4j：等效生成下图，代码中可以对日志进行处理
  * ![image-20231002144903310](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231002144903310.png)
  * ​    log.info("Order submitted: {}", order);    可以打印log信息

```java
package tacos.web;
import javax.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;

import lombok.extern.slf4j.Slf4j;
import tacos.TacoOrder;

@Slf4j
@Controller
@RequestMapping("/orders")
@SessionAttributes("tacoOrder")
public class OrderController {

  @GetMapping("/current")
  public String orderForm() {
    return "orderForm";
  }

/*
  @PostMapping
  public String processOrder(TacoOrder order,
		  SessionStatus sessionStatus) {
    log.info("Order submitted: {}", order);
    sessionStatus.setComplete();

    return "redirect:/";
  }
*/

  @PostMapping
  public String processOrder(@Valid TacoOrder order, Errors errors,
		  SessionStatus sessionStatus) {
    if (errors.hasErrors()) {
      return "orderForm";
    }

    log.info("Order submitted: {}", order);
    sessionStatus.setComplete();

    return "redirect:/";
  }
}
```

## 处理表单提交 

* Converter 
* ✓ 将String转换成Ingredient
* redirect重定向
  * ![image-20231009142037835](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231009142037835.png)

### toco的转化器converter

* key为id，value为ingredient
* 用来做参数的转换
* 只需要将这个类实例化在上下文中，spring会在合适的时候对对象进行这样的转换

```java
package tacos.web;

import java.util.HashMap;
import java.util.Map;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import tacos.Ingredient;
import tacos.Ingredient.Type;

@Component
public class IngredientByIdConverter implements Converter<String, Ingredient> {

  private Map<String, Ingredient> ingredientMap = new HashMap<>();
  
  public IngredientByIdConverter() {
    ingredientMap.put("FLTO", 
        new Ingredient("FLTO", "Flour Tortilla", Type.WRAP));
    ingredientMap.put("COTO", 
        new Ingredient("COTO", "Corn Tortilla", Type.WRAP));
    ingredientMap.put("GRBF", 
        new Ingredient("GRBF", "Ground Beef", Type.PROTEIN));
    ingredientMap.put("CARN", 
        new Ingredient("CARN", "Carnitas", Type.PROTEIN));
    ingredientMap.put("TMTO", 
        new Ingredient("TMTO", "Diced Tomatoes", Type.VEGGIES));
    ingredientMap.put("LETC", 
        new Ingredient("LETC", "Lettuce", Type.VEGGIES));
    ingredientMap.put("CHED", 
        new Ingredient("CHED", "Cheddar", Type.CHEESE));
    ingredientMap.put("JACK", 
        new Ingredient("JACK", "Monterrey Jack", Type.CHEESE));
    ingredientMap.put("SLSA", 
        new Ingredient("SLSA", "Salsa", Type.SAUCE));
    ingredientMap.put("SRCR", 
        new Ingredient("SRCR", "Sour Cream", Type.SAUCE));
  }
  
  @Override
  public Ingredient convert(String id) {
    return ingredientMap.get(id);
  }
}
```

### 路径参数@PathVariable

![image-20231002163242385](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231002163242385.png)

### 请求参数(查询参数)@RequestParam

![image-20231002163429476](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231002163429476.png)

表单参数，默认，对应model，可以使用@Valid校验
json请求体，@RequestBody



## Spring MVC获取参数的几种方式👍

* 表单 (form)参数，转成model (成员类型可能会用到Converter进行类型转换)，可以使用@Valid校验
* 路径参数，@PathVariable，例子:/book/{id}
* 请求参数(查询参数)，@RequestParam，例子: /challenge?mode=2&id=13412431234
* json请求体，@RequestBody，会用到HttpMessageConverter消息转换器，Rest API
  * HttpMessageConverter：json与java对象互转



## Spring MVC的请求处理过程👍

![image-20231009131203096](ch04-Web%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%20Web%20MVC/image-20231009131203096.png)

* Web容器开发的基本单元是Servlet，请求先到servlet。
* mapping根据url把请求转到controller，其中spring框架会做参数解析。
* controller接受请求，数据解析，拿到数据后转到业务层
* 业务层：处理，数据持久化，访问数据库层
* 数据库层：数据库访问层Dao，分关系型数据库和非关系型数据库，返回控制器层
* 控制器层返回数据到DispatcherServlt，DispatcherServlt拿到数据和逻辑视图名
* 逻辑视图名与特定的页面渲染的第三方库，渲染视图，返回浏览器端
* DispatcherServlt：spring自己实现的，用途就是截获request

## Spring MVC的请求映射注解👍

@RequestMapping 

@GetMapping ：获取

@PostMapping ：提交数据、创建新资源

@PutMapping ：更新资源

@DeleteMapping ：删除资源 	

@PatchMapping

## 重定向👍

控制器处理完成后可以返回逻辑视图名，也可以重定向到其他url

- http状态码：302
- 控制器`return redirect:`

## Servlet规范

- 实现
  - tomcat
  - jetty
- 最小开发单元

* Web容器的实现规范，与Spring无关
  - Web容器/服务器，里面放Servlet对象

### Servlet对象

Request（可以带很多property属性，key-value数据结构）

Response

## 校验表单输入 

* JavaBean Validation API
* spring-boot-starter-validation（有Hibernate针对 JavaBean Validation API的实现）
  * 领域类上添加校验规则 
  * 控制器中声明校验：@Valid
  * 修改表单视图以展现校验错误

```xml
<!-- tag::validationStarter[] --
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
<!-- end::validationStarter[] -->
```



## 更多视图模板库

Thymeleaf
FreeMarker
Groovy Templates
JSP
Mustache

## 使用视图控制器（View Controller） 

* 如果一个控制器非常简单，不需要填充模型或处理输入
* 接口WebMvcConfigurer，用于配置
*  简单的从请求URL到视图 ✓ registry.addViewController("/").setViewName("home"); //GET请求 
*  接口WebMvcConfigurer也可实现到启动类中