---
title: 服务端-ch07-Spring Security
date: 2023-10-19 18:32:34
categories: 服务端开发
tags: 服务端开发
---

本文部分内容参考[6-Spring Security - Charlie's Blog (chillcharlie357.github.io)](https://chillcharlie357.github.io/posts/b9233e24/)

- 划分为两类：
  1. 针对客户web请求权限控制
  2. 针对方法级的权限控制
     - 针对业务层代码
     - 调用前控制，调用后控制
     - 例：对数据库delete操作做权限控制
- 在spring中使用：添加依赖`spring-boot-starter-security`后会自动加载安全相关的bean

# 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

# 加了security starter后自动获得登录界面

* 用户名：user 
* 密码查看日志：Using generated security  password: cb81f1d1-c11e-4b0a-b728- 92d591ffa9c5

# Cookie访问会话的维持

访问一开始的design页面会获得一个http状态码302，重定向到login页面

登录完成以后，服务端返回一个set cookie的属性，里面有JSESSIONID，以后的每次请求都会带上这个id，作为请求头发送到服务端，服务端就知道每次的请求来自哪个

![image-20231021101814154](ch07-Spring%20Security/image-20231021101814154.png)

![image-20231021102857267](ch07-Spring%20Security/image-20231021102857267.png)

# 开发要做什么

> 除了框架提供的，开发人员还需要做什么，很重要

1. 实现接口
   * `UserDetailsService`接口：给Spring框架提供用户详细信息。用户信息注册存储，需要用到用户信息的时候从数据访问层获取
     * 这里用到之前讲到数据访问层实现技术。
     * 和spring security解耦，只需要提供用户信息但不关心怎么实现。
   * 被Spring Security调用
2. 实现密码加密/解密对象
   - PasswordEncoder
   - Bean对象
3. (optional)实现登录页面
   - 有默认页面
   - `/login`, Spring已经自动实现了对应的`Controller`
4. 权限设定
   1. `SecurityFilterChain`，基于注入的`httpSecurity`对象
   2. 继承父类`WebSecurityConfigurerAdapter`，实现`configure`方法

![image-20231020204541469](ch07-Spring%20Security/image-20231020204541469.png)

![image-20231029113830536](ch07-Spring%20Security/image-20231029113830536.png)

# 框架实现了什么

1. 实现用户登录控制器get post
2. 请求重定向到用户登录页面
   - eg.用户未登录时，访问URL，服务端重定向到登录页面
3. 通过Filter对用户设定的权限进行权限控制

# 两种配置 

* 纯Java配置类 

  @Configuration public class SecurityConfig { }

  **SecurityFilterChain ：直接从上下文注入，然后不用实现，可以在里面对web请求做权限控制authorizeRequests/替换login页面**

*  继承自WebSecurityConfigurerAdapter 

  @Configuration public class SecurityConfig extends WebSecurityConfigurerAdapter {

## 第一种

security config

```java
package tacos.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import tacos.User;
import tacos.data.UserRepository;

@Configuration
public class SecurityConfig {
  
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

//  @Bean
//  public UserDetailsService userDetailsService(PasswordEncoder encoder) {
//    List<UserDetails> usersList = new ArrayList<>();
//    usersList.add(new User("buzz",encoder.encode("infinity"),Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"))));
//    usersList.add(new User("woody",encoder.encode("bullseye"),Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"))));
//    return new InMemoryUserDetailsManager(usersList);
//  }

  @Bean
  public UserDetailsService userDetailsService(UserRepository userRepo) {
    return username -> {
      User user = userRepo.findByUsername(username);
      if (user != null) {
        return user;
      }
      throw new UsernameNotFoundException(
                      "User '" + username + "' not found");
    };
  }
  
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
      //对design和orders为前缀的做一个权限控制：只有经过认证的用户才能访问该前缀，而且用户属于user角色（参见user.java），如果符合，所有权限都放行
    return http
      .authorizeRequests()
        .mvcMatchers("/design", "/orders").hasRole("USER")
        .anyRequest().permitAll()

        //自己提供一个login页面
        //可以在此指定username和password的参数
        //.usernameParameter("user")
        //.passwordParameter("password22")
      .and()
        .formLogin()
          .loginPage("/login")
          
      .and()
        .logout()
          .logoutSuccessUrl("/")
          
      // Make H2-Console non-secured; for debug purposes
      .and()
        .csrf()
          .ignoringAntMatchers("/h2-console/**")
  
      // Allow pages to be loaded in frames from the same origin; needed for H2-Console
      .and()  
        .headers()
          .frameOptions()
            .sameOrigin()
            
       .and()
       .build();
  }
  
}

```

## 第二种

security config

```java
package tacos.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  @Autowired
  private UserDetailsService userDetailsService;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .authorizeRequests()
        .antMatchers("/design", "/orders").access("hasRole('USER')")
        .antMatchers("/", "/**").access("permitAll")

      .and()
        .formLogin()
          .loginPage("/login")

      .and()
        .logout()
          .logoutSuccessUrl("/")

      .and()
      .httpBasic()
      .realmName("tacos")

      // Make H2-Console non-secured; for debug purposes
      .and()
        .csrf()
          .ignoringAntMatchers("/h2-console/**")
//            .ignoringAntMatchers("/admin/**")

      // Allow pages to be loaded in frames from the same origin; needed for H2-Console
      .and()
        .headers()
          .frameOptions()
            .sameOrigin()
      ;
  }

  /*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {

    auth
      .userDetailsService(userDetailsService);

  }
   */

  @Bean
  public PasswordEncoder encoder() {
    return new BCryptPasswordEncoder();
  }


//  @Override
//  protected void configure(AuthenticationManagerBuilder auth)
//      throws Exception {
//
//    auth
//      .userDetailsService(userDetailsService)
//      .passwordEncoder(encoder());
//
//  }

//
// IN MEMORY AUTHENTICATION EXAMPLE
//
/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {

    auth
      .inMemoryAuthentication()
        .withUser("buzz")
          .password("infinity")
          .authorities("ROLE_USER")
        .and()
        .withUser("woody")
          .password("bullseye")
          .authorities("ROLE_USER");

  }
*/

//
// JDBC Authentication example
//
/*
  @Autowired
  DataSource dataSource;

  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {

    auth
      .jdbcAuthentication()
        .dataSource(dataSource);

  }
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {

    auth
      .jdbcAuthentication()
        .dataSource(dataSource)
        .usersByUsernameQuery(
            "select username, password, enabled from Users " +
            "where username=?")
        .authoritiesByUsernameQuery(
            "select username, authority from UserAuthorities " +
            "where username=?");

  }
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {

    auth
      .jdbcAuthentication()
        .dataSource(dataSource)
        .usersByUsernameQuery(
            "select username, password, enabled from Users " +
            "where username=?")
        .authoritiesByUsernameQuery(
            "select username, authority from UserAuthorities " +
            "where username=?")
        .passwordEncoder(new BCryptPasswordEncoder());

  }
*/


//
// LDAP Authentication example
//
/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {
    auth
      .ldapAuthentication()
        .userSearchFilter("(uid={0})")
        .groupSearchFilter("member={0}");
  }
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {
    auth
      .ldapAuthentication()
        .userSearchBase("ou=people")
        .userSearchFilter("(uid={0})")
        .groupSearchBase("ou=groups")
        .groupSearchFilter("member={0}");
  }
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {
    auth
      .ldapAuthentication()
        .userSearchBase("ou=people")
        .userSearchFilter("(uid={0})")
        .groupSearchBase("ou=groups")
        .groupSearchFilter("member={0}")
        .passwordCompare();
  }
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {
    auth
      .ldapAuthentication()
        .userSearchBase("ou=people")
        .userSearchFilter("(uid={0})")
        .groupSearchBase("ou=groups")
        .groupSearchFilter("member={0}")
        .passwordCompare()
        .passwordEncoder(new BCryptPasswordEncoder())
        .passwordAttribute("passcode");
  }
*/

/*
@Override
protected void configure(AuthenticationManagerBuilder auth)
    throws Exception {
  auth
    .ldapAuthentication()
      .userSearchBase("ou=people")
      .userSearchFilter("(uid={0})")
      .groupSearchBase("ou=groups")
      .groupSearchFilter("member={0}")
      .passwordCompare()
      .passwordEncoder(new BCryptPasswordEncoder())
      .passwordAttribute("passcode")
      .and()
      .contextSource()
        .url("ldap://tacocloud.com:389/dc=tacocloud,dc=com");
}
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {
    auth
      .ldapAuthentication()
        .userSearchBase("ou=people")
        .userSearchFilter("(uid={0})")
        .groupSearchBase("ou=groups")
        .groupSearchFilter("member={0}")
        .passwordCompare()
        .passwordEncoder(new BCryptPasswordEncoder())
        .passwordAttribute("passcode")
        .and()
        .contextSource()
          .root("dc=tacocloud,dc=com");
  }
*/

/*
  @Override
  protected void configure(AuthenticationManagerBuilder auth)
      throws Exception {
    auth
      .ldapAuthentication()
        .userSearchBase("ou=people")
        .userSearchFilter("(uid={0})")
        .groupSearchBase("ou=groups")
        .groupSearchFilter("member={0}")
        .passwordCompare()
        .passwordEncoder(new BCryptPasswordEncoder())
        .passwordAttribute("passcode")
        .and()
        .contextSource()
          .root("dc=tacocloud,dc=com")
          .ldif("classpath:users.ldif");
  }
*/

}

```



# 纯Java配置类 

* 提供密码转换器：PasswordEncoder 
* 提供接口实现：UserDetailsService，用于从用户名获取用户信息

# 密码转码器 

* NoOpPasswordEncoder：不编码密码，而保持明文，因为它不会对密码进行哈希化，所以永远不要在真实场 景中使用它 
* StandardPasswordEncoder：使用SHA-256对密码进行哈希化。这个实现现在已经不推荐了，不应该在新的 实现中使用它
* Pbkdf2PasswordEncoder：使用基于密码的密钥派生函数2（PBKDF2)
* BCryptPasswordEncoder：使用bcrypt强哈希函数对密码进行编码 
* SCryptPasswordEncoder：使用scrypt强哈希函数对密码进行编码

# 用户信息存储

来自多个渠道，spring security不关心。 

* 内存用户存储 ： **security config中的configure**

  * ```java
    // IN MEMORY AUTHENTICATION EXAMPLE
    //
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
    
        auth
          .inMemoryAuthentication()
            .withUser("buzz")
              .password("infinity")
              .authorities("ROLE_USER")
            .and()
            .withUser("woody")
              .password("bullseye")
              .authorities("ROLE_USER");
      }
    
    
    //
    // JDBC Authentication example
    //
    /*
      @Autowired
      DataSource dataSource;
    
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
    
        auth
          .jdbcAuthentication()
            .dataSource(dataSource);
    
      }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
    
        auth
          .jdbcAuthentication()
            .dataSource(dataSource)
            .usersByUsernameQuery(
                "select username, password, enabled from Users " +
                "where username=?")
            .authoritiesByUsernameQuery(
                "select username, authority from UserAuthorities " +
                "where username=?");
    
      }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
    
        auth
          .jdbcAuthentication()
            .dataSource(dataSource)
            .usersByUsernameQuery(
                "select username, password, enabled from Users " +
                "where username=?")
            .authoritiesByUsernameQuery(
                "select username, authority from UserAuthorities " +
                "where username=?")
            .passwordEncoder(new BCryptPasswordEncoder());
    
      }
    */
    
    
    //
    // LDAP Authentication example
    //
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
        auth
          .ldapAuthentication()
            .userSearchFilter("(uid={0})")
            .groupSearchFilter("member={0}");
      }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
        auth
          .ldapAuthentication()
            .userSearchBase("ou=people")
            .userSearchFilter("(uid={0})")
            .groupSearchBase("ou=groups")
            .groupSearchFilter("member={0}");
      }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
        auth
          .ldapAuthentication()
            .userSearchBase("ou=people")
            .userSearchFilter("(uid={0})")
            .groupSearchBase("ou=groups")
            .groupSearchFilter("member={0}")
            .passwordCompare();
      }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
        auth
          .ldapAuthentication()
            .userSearchBase("ou=people")
            .userSearchFilter("(uid={0})")
            .groupSearchBase("ou=groups")
            .groupSearchFilter("member={0}")
            .passwordCompare()
            .passwordEncoder(new BCryptPasswordEncoder())
            .passwordAttribute("passcode");
      }
    */
    
    /*
    @Override
    protected void configure(AuthenticationManagerBuilder auth)
        throws Exception {
      auth
        .ldapAuthentication()
          .userSearchBase("ou=people")
          .userSearchFilter("(uid={0})")
          .groupSearchBase("ou=groups")
          .groupSearchFilter("member={0}")
          .passwordCompare()
          .passwordEncoder(new BCryptPasswordEncoder())
          .passwordAttribute("passcode")
          .and()
          .contextSource()
            .url("ldap://tacocloud.com:389/dc=tacocloud,dc=com");
    }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
        auth
          .ldapAuthentication()
            .userSearchBase("ou=people")
            .userSearchFilter("(uid={0})")
            .groupSearchBase("ou=groups")
            .groupSearchFilter("member={0}")
            .passwordCompare()
            .passwordEncoder(new BCryptPasswordEncoder())
            .passwordAttribute("passcode")
            .and()
            .contextSource()
              .root("dc=tacocloud,dc=com");
      }
    */
    
    /*
      @Override
      protected void configure(AuthenticationManagerBuilder auth)
          throws Exception {
        auth
          .ldapAuthentication()
            .userSearchBase("ou=people")
            .userSearchFilter("(uid={0})")
            .groupSearchBase("ou=groups")
            .groupSearchFilter("member={0}")
            .passwordCompare()
            .passwordEncoder(new BCryptPasswordEncoder())
            .passwordAttribute("passcode")
            .and()
            .contextSource()
              .root("dc=tacocloud,dc=com")
              .ldif("classpath:users.ldif");
      }
    */
    ```
  
* JDBC用户存储

* LDAP用户存储

## 使用Spring Data存储库来保存用户 

* 定义领域对象：User，实现了UserDetails接口
  * UserDetailsService接口方法：UserDetails 
  * -loadUserByUsername(String username) 
* 定义持久化接口：UserRepository，增加自定义方法：findByUsername

user

```java
package tacos;
import java.util.Arrays;
import java.util.Collection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.
                                          SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Entity
@Data
@NoArgsConstructor(access=AccessLevel.PRIVATE, force=true)
@RequiredArgsConstructor
public class User implements UserDetails {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Long id;
  
  private final String username;
  private final String password;
  private final String fullname;
  private final String street;
  private final String city;
  private final String state;
  private final String zip;
  private final String phoneNumber;
  
    //获取权限集合，自定了一个user的role：用户的角色叫user，是user角色的用户拥有ROLE_USER权限
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
```



login.xml

```xml
<!-- tag::all[] -->
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org">
  <head>
    <title>Taco Cloud</title>
  </head>

  <body>
    <h1>Login</h1>
    <img th:src="@{/images/TacoCloud.png}"/>

    <div th:if="${error}">
      Unable to login. Check your username and password.
    </div>

    <p>New here? Click
       <a th:href="@{/register}">here</a> to register.</p>

    <!-- tag::thAction[] -->
    <form method="POST" th:action="@{/login}" id="loginForm">
    <!-- end::thAction[] -->
      <label for="username">Username: </label>
      <input type="text" name="username" id="username" /><br/>

      <label for="password">Password: </label>
      <input type="password" name="password" id="password" /><br/>

      <input type="submit" value="Login"/>
    </form>
  </body>
</html>
<!-- end::all[] -->

```

web config

* ViewController：视图控制器：
  * addViewController("/").setViewName("home")：请求是/，转向home页面

```java
package tacos.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/").setViewName("home");
    registry.addViewController("/login");
  }
}
```

## 注册用户 

* RegistrationController

# 保护Web请求 

@Bean 

public SecurityFilterChain filterChain(HttpSecurity http) 

# 启用HTTP Basic认证👍

**HTTP协议内容，与Spring框架无关。**

由于用户 ID 与密码是是以明文的形式在网络中进行传输的（尽管采用了 base64 编码，但是 base64 算法是可逆的），所以基本验证方案并**不安全**。

- **启用HTTP basic认证: `httpBasic()`**
  - 默认关闭
- 在请求时带上用户名密码，一般在测试的时候使用
  - `Authorization`属性
  - `https://username:password@www.example.com/`

[HTTP authentication - HTTP | MDN ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)

# 权限分类

* Authority，权限 
* Role，角色，===>>>权限，加前缀：ROLE_

## 自定义登录页面

使用`HttpSecurity`对象配置。

- 当需要认证时转向的登录页：`.loginPage("/login")`
- 视图控制器，定义login请求对应的视图：`registry.addViewController("/login")`;
- 登录的post请求由Spring Security自动处理，名称默认：`username`、`password`，可配置

```
formLogin()
.loginPage("/login").usernameParamrter('username').passwordParamet
```

## 实现方法级别的安全 

```java
@Configuration 

@EnableGlobalMethodSecurity 

public class SecurityConfig extends WebSecurityConfigurerAdapter { @PreAuthorize("hasRole('ADMIN')")
```

## 获取当前登录的用户 

- 注入`Principal`对象
  - 来自`java.security`，是JDK中JASS的低层框架
  - `String username = principal.getName()`获取用户名
- `@AuthenticationPrincipal`注解
  - 来自`Spring Security`
  - `@AuthenticationPrincipal User user`作为函数参数获得user对象

1. DesignTacoController 参数：

   ```java
   Principal principal String username = principal.getName(); 
   ```

2. OrderController 

   ```java
   @AuthenticationPrincipal User user 
   ```

3. 安全上下文获取 

   ```java
   Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); 
   User user = (User) authentication.getPrincipal();
   ```

第二种方式的代码：OrderController

```java
package tacos.web;
import javax.validation.Valid;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;

import tacos.TacoOrder;
import tacos.User;
import tacos.data.OrderRepository;

@Controller
@RequestMapping("/orders")
@SessionAttributes("order")
public class OrderController {

  private OrderRepository orderRepo;

  private OrderProps props;

  public OrderController(OrderRepository orderRepo,
          OrderProps props) {
    this.orderRepo = orderRepo;
    this.props = props;
  }

  @GetMapping("/current")
  public String orderForm(@AuthenticationPrincipal User user,
      @ModelAttribute TacoOrder order) {
    if (order.getDeliveryName() == null) {
      order.setDeliveryName(user.getFullname());
    }
    if (order.getDeliveryStreet() == null) {
      order.setDeliveryStreet(user.getStreet());
    }
    if (order.getDeliveryCity() == null) {
      order.setDeliveryCity(user.getCity());
    }
    if (order.getDeliveryState() == null) {
      order.setDeliveryState(user.getState());
    }
    if (order.getDeliveryZip() == null) {
      order.setDeliveryZip(user.getZip());
    }

    return "orderForm";
  }

  @PostMapping
  public String processOrder(@Valid TacoOrder order, Errors errors,
      SessionStatus sessionStatus,
      @AuthenticationPrincipal User user) {

    if (errors.hasErrors()) {
      return "orderForm";
    }

    order.setUser(user);

    orderRepo.save(order);
    sessionStatus.setComplete();

    return "redirect:/";
  }

  @GetMapping
  public String ordersForUser(
      @AuthenticationPrincipal User user, Model model) {

    Pageable pageable = PageRequest.of(0, props.getPageSize());
    model.addAttribute("orders",
        orderRepo.findByUserOrderByPlacedAtDesc(user, pageable));

    return "orderList";
  }

  /*
  @GetMapping
  public String ordersForUser(
      @AuthenticationPrincipal User user, Model model) {

    Pageable pageable = PageRequest.of(0, 20);
    model.addAttribute("orders",
        orderRepo.findByUserOrderByPlacedAtDesc(user, pageable));

    return "orderList";
  }
   */

  /*
  @GetMapping
  public String ordersForUser(
      @AuthenticationPrincipal User user, Model model) {

    model.addAttribute("orders",
        orderRepo.findByUserOrderByPlacedAtDesc(user));

    return "orderList";
  }
   */

}
```



# CSRF攻击

- 跨站请求伪造
  - 攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

![image-20231021155148002](ch07-Spring%20Security/image-20231021155148002.png)

==**出现报错 403 + forbidden的原因：缺少\_csrf**==

![image-20231021190633439](ch07-Spring%20Security/image-20231021190633439.png)

![image-20231021190543766](ch07-Spring%20Security/image-20231021190543766.png)

- > 例子：本段借鉴charlie老师的博客内容

  1. 受害者登录a.com，并保留了登录凭证（Cookie）。
  2. 攻击者引诱受害者访问了b.com。
  3. b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带a.com的Cookie。
  4. a.com接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求。
  5. a.com以受害者的名义执行了act=xx。
  6. 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让a.com执行了自己定义的操作。

- 解决：C每次提交表单A，**_csrf 字段**有唯一ID，无法伪造

  - get得到`_csrf`， post请求携带`_csrf` ，防止第三方伪造
  - ==**不在cookie中**==

![image.png](https://chillcharlie-img.oss-cn-hangzhou.aliyuncs.com/image%2F2023%2F10%2F16%2F6a1a8a2f1ac8edf6f33638931d9d15b6_20231016210157.png)

# 更改日志的等级

application.properties

```
logging.level.root=debug
```

