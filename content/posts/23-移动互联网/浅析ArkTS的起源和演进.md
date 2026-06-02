---
title: ArkTS的起源、演进和使用
date: 2023-10-04 11:40:36
tags: openharmony
categories: openharmony

---



# 浅析ArkTS的起源和演进

# 1 引言

Mozilla创造了JS，Microsoft创建了TS，Huawei进一步推出了ArkTS。

从最初的基础的逻辑交互能力，到具备类型系统的高效工程开发能力，再到融合声明式UI、多维状态管理等丰富的应用开发能力，共同组成了相关的演进脉络。

ArkTS是HarmonyOS优选的主力应用开发语言。它在TypeScript（简称TS）的基础上，扩展了声明式UI、状态管理等相应的能力，让开发者可以以更简洁、更自然的方式开发高性能应用。TS是JavaScript（简称JS）的超集，ArkTS则是TS的超集。ArkTS会结合应用开发和运行的需求持续演进，包括但不限于引入分布式开发范式、并行和并发能力增强、类型系统增强等方面的语言特性。本期我们结合JS和TS以及相关的开发框架的发展，为大家介绍ArkTS的起源和演进思路。

# 2 JS

JS语言由Mozilla创造，最初主要是为了解决页面中的逻辑交互问题，它和HTML（负责页面内容）、CSS（负责页面布局和样式）共同组成了Web页面/应用开发的基础。随着Web和浏览器的普及，以及Node.js进一步将JS扩展到了浏览器以外的环境，JS语言得到了飞速的发展。在2015年相关的标准组织ECMA发布了一个主要的版本ECMAScript 6（简称ES6），这个版本具备了较为完整的语言能力，包括类（Class）、模块（Module）、相关的语言基础API增强（Map/Set等）、箭头函数（Arrow Function）等。从2015年开始，ECMA每年都会发布一个标准版本，比如ES2016/ES2017/ES2018等，JS语言越来越成熟。

为了提升应用的开发效率，相应的JS前端框架也不断地涌现出来。其中比较典型的有Facebook发起的React.js，以及个人开发者尤雨溪发起的Vue.js。React和Vue的主要出发点都是将响应式编程的能力引入到应用开发中，实现数据和界面内容的自动关联处理。具体的实现方式上，React对JS做了一些扩展，引入了JSX（JavaScript XML）语法，可以将HTML的内容统一表示成JS来处理；Vue则是通过扩展的模板语法（Template）的方式来处理。

下面通过两个示例，为大家简要介绍React和Vue。（**示例来源于w3schools网站：**https://www.w3schools.com/whatis/）

**1. React示例**

**图1** React示例

![img](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/103/404/958/0260086000103404958.20221102104340.94108790062912697966750549293034:50001231000000:2800:DBC3B5AE63B6879EE21AF9E59D564ADAFE30E9D7CDFF6E6EA226D4128B2982C5.png)

以上代码描述了React如何在指定的页面元素（id为id01的div元素）中改变相应的字符串内容（从"Hello World!"到"Hello John Doe!"）。其中第5行的ReactDOM.render()是React JS库提供的一个方法，它可以将相应的内容刷新到指定的HTML元素中。第6行是符合JSX语义的一段代码，它包含了一个类似HTML结构的字符串（<h1>...</h1>），以及一个表达数据绑定语义的字段({name})，会关联到第4行定义的name变量。通过这种方式，JSX把HTML的语义以及数据绑定机制和JS语言结合起来，可以方便地在JS语言中使用。

**2. Vue示例**

**图2** Vue示例

![img](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/103/404/958/0260086000103404958.20221102104352.79912171437667408945886710827184:50001231000000:2800:112F46F30295D467BA9DFF79E4FF0970B0F988D51013AF8C2460142BE3BA0DC9.png)

以上Vue示例代码也描述了类似的功能。其中第1~3行是类似HTML的语法，描述一个id为app的div页面元素，其中的{{message}}是数据绑定的语义，在Vue中表示为Template。第6~9行是JS代码，描述了一个Vue对象，对应了上述的app页面元素以及所需的数据变量message的内容信息。第11~13行则是JS函数，它改变message变量的值为"John Doe"。执行这个函数时Vue会自动实现相应的UI界面刷新。

如上所示，React和Vue所表达的能力是类似的，不过侧重点稍微有所不同。React主要是基于JSX的语法，将类HTML的语法融合到JS语言中；Vue则是基于Template机制，在HTML的基础上扩展相应的语义。当然，上面这两个例子只是简要地描述了React和Vue的基础信息，更详细的语法以及CSS相关的使用等都没涉及。

从运行时的维度来看，基于React以及Vue的应用都可运行在Web引擎上。为了进一步提升相应的性能体验，2015年Facebook在React基础上推出了React Native, 在渲染架构上没有采用传统的Web引擎渲染路径，而是桥接到相应OS平台的原生UI组件上。2019年Facebook引入全新实现的JS引擎Hermes，并推出一系列架构改进来进一步提升React Native的性能体验。2016年阿里巴巴开源的Weex则是基于Vue做了一些类似的改进，也是采用了桥接到原生UI组件的渲染路径。

# 3 TS

随着JS生态的发展，如何更有效地支撑大型的应用工程开发变成了一个重要的课题。大型的应用工程一般会涉及较复杂的代码以及较多的团队协作，对语言的规范性，模块的复用性、扩展性以及相关的开发工具都提出了更高的要求。为此，Microsoft在JS的基础上，创建了TS语言，并在2014年正式发布了1.0版本。TS主要从以下几个方面做了进一步的增强：

- 引入了类型系统，并提供了类型检查以及类型自动推导能力，可以进行编译时错误检查，有效的提升了代码的规范性以及错误检测范围和效率。
- 在类型系统基础上，引入了声明文件（Declaration Files）来管理接口或其他自定义类型。声明文件一般是以d.ts的形式来定义模块中的接口，这些接口和具体的实现做了相应的分离，有助于各模块之间的分工协作。另外，TS通过接口，泛型（Generics）等相关特性的支持，进一步增强了设计复杂的框架所需的扩展以及复用能力。

在工具层面，TS也有相应的编辑器、编译器、IDE（Integrated Development Environment）插件等相关的工具，来进一步提升开发效率。

TS在兼容JS生态方面也做了较好的平衡，TS应用通过相应编译器可以编译出纯JS应用，可以在标准的JS引擎上运行。同时，TS定位为JS的超集，即JS应用也是合法的TS应用。此外，在标准层面上，TS兼容ECMA的相应标准，并维护那些还未成为ECMA标准的新特性。

# 4 ArkTS

如上所述，基于JS的前端框架以及TS的引入，进一步提升了应用开发效率，但依然存在一些不足。

**从开发者维度来看：**

写一个应用需要了解三种语言（JS/TS、HTML和CSS）。这对Web开发者相对友好，但对非Web开发者来说，负担较重。

**从运行时维度来看：**

- 在语言运行时方面，尽管TS有了类型的加持，但也只是用于编译时检查，然后通过TS Compiler转成JS，运行时引擎还是无法利用到基于类型系统的优化。
- 在渲染方面，主流Web引擎由于本身复杂度以及历史原因，性能、资源占用方面与常见OS原生框架都有一定的差距，尤其在移动平台上。React Native通过渲染架构的改进一定程度上提升了性能体验，但在平台渲染效果和能力的一致性，以及JS语言性能等方面还是存在一定的不足。

Google在2018年底推出的Flutter则走了另外一条路，结合新的语言Dart，引入新的声明式开发范式，基于Skia的自绘制引擎构建可跨平台的独立的渲染能力。这是一种较为创新的方案，不过也有几点不足：

- Dart语言生态。尽管Dart语言2011年就已推出，传闻其目标是取代JS，但整个生态还是非常弱小，Dart语言发布7年后随着Flutter的推出才有所改善。整体而言，Dart和主流语言生态相比还是有非常大的差距。
- 开发范式。Flutter暴露了很多细粒度的Widget接口，整体开发的简洁度，开发门槛，尤其是和Apple推出的SwiftUI相比，存在一定的差距。

有意思的是，Google在2021年又推出了新的开发框架Jetpack Compose，结合了Kotlin的语言生态，设计了新的声明式UI开发范式。

2019年，我们在思考如何构建新的应用开发框架的时候，从以下几个维度进行了重点考虑：

- 语言生态
- 开发效率
- 性能体验
- 跨设备/跨平台能力

由于JS/TS有比较完善的开发者生态，语言也比较中立友好，有相应的标准组织可以逐步演进，JS/TS语言成了比较自然的选择。以JS/TS为基础，在开发框架的维度，我们做了如下的架构演进设计：

- 通过基于JS扩展的类Web开发范式，来支持主流的前端开发方式。同步的，在运行时方面，通过渲染引擎的增强（平台无关的自绘制机制、声明式UI后端设计、动态布局/多态UI组件等），语言编译器和运行时的优化增强（代码预编译、高效FFI-Foreign Function Interface、引擎极小化等），进一步提升相关的性能体验，并可部署到不同设备上（包括百KB级内存的轻量设备）。另外，通过平台适配层的设计，构建了跨OS平台的基础设施。
- 通过基于TS扩展的声明式UI开发范式，提供了更简洁更自然的开发体验。在运行时方面，在上述的基础上，结合语言运行时的类型优化，以及渲染运行时的扁平化流水线技术等，进一步提升性能体验。

**图3** ArkUI开发框架

![img](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/103/404/958/0260086000103404958.20221102104405.81053425986211736818236644416294:50001231000000:2800:C4BDB880E1D7503824BBA83A0D6B298C45167CE3A25BE6CDEEB552C343EF8AE5.png)

图3描述了ArkUI开发框架的整体架构，其中，基于TS扩展的声明式UI范式中所用的语言就是ArkTS。下面结合一个具体示例，从应用开发视角简单介绍下基于ArkTS的全新声明式开发范式。

如图4所示的代码示例，UI界面会显示两段文本和一个按钮，当开发者点击按钮时，文本内容会从'Hello World'变为‘Hello ArkUI’。

**图4** ArkTS声明式开发范式

![img](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/103/404/958/0260086000103404958.20221102104418.97167608875006783664909326988909:50001231000000:2800:B0A2A3474E494DE620CBF58C0DBB2F835EBDAC07C87E2376865D3CA5ED979896.png)

![image-20231004144644403](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004144644403.png)

这个示例中所包含的ArkTS声明式开发范式的基本组成说明如下：**

- **装饰器**

用来装饰类、结构体、方法以及变量，赋予其特殊的含义，如上述示例中 @Entry 、 @Component 、 @State 都是装饰器。具体而言， @Component 表示这是个自定义组件； @Entry 则表示这是个入口组件； @State 表示组件中的状态变量，此状态变化会引起 UI 变更。

- **自定义组件**

可复用的 UI 单元，可组合其它组件，如上述被 @Component 装饰的 struct Hello。

![image-20231004144745451](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004144745451.png)

![image-20231004144846194](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004144846194.png)

![image-20231004144919281](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004144919281.png)

- **UI 描述**

声明式的方式来描述 UI 的结构，如上述 build() 方法内部的代码块。

- **内置组件**

框架中默认内置的基础和布局组件，可直接被开发者调用，比如示例中的 Column、Text、Divider、Button。

- **事件方法**

用于添加组件对事件的响应逻辑，统一通过事件方法进行设置，如跟随在Button后面的onClick()。

- **属性方法**

用于组件属性的配置，统一通过属性方法进行设置，如fontSize()、width()、height()、color() 等，可通过链式调用的方式设置多项属性。

从UI框架的需求角度，ArkTS在TS的类型系统的基础上，做了进一步的扩展：**定义了各种装饰器、自定义组件和UI描述机制**，再配合UI开发框架中的UI内置组件、事件方法、属性方法等共同构成了应用开发的主体。在应用开发中，除了UI的结构化描述之外，还有一个重要的方面：**状态管理**。如上述示例中，用 @State 装饰过的变量 myText ，包含了一个基础的状态管理机制，即 myText 的值的变化会自动触发相应的 UI 变更 （Text组件）。**ArkUI 中进一步提供了多维度的状态管理机制**。和 UI 相关联的数据，不仅可以在组件内使用，还可以在不同组件层级间传递，比如父子组件之间，爷孙组件之间，也可以是全局范围内的传递，还可以是跨设备传递。另外，从数据的传递形式来看，可分为**只读的单向传递和可变更的双向传递**。开发者可以灵活的利用这些能力来实现数据和 UI 的联动。

总体而言，ArkUI开发框架通过扩展成熟语言、结合语法糖或者语言原生的元编程能力、以及UI组件、状态管理等方面设计了统一的UI开发范式，结合原生语言能力共同完成应用开发。这些构成了当前ArkTS基于TS的主要扩展。

* 生命周期

![image-20231004145003547](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004145003547.png)

abouttoappear函数中可以初始化数据

**回调函数是系统自动调用，无法手动调用**

![image-20231004145632846](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004145632846.png)

* 条件渲染：

![image-20231004145927663](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004145927663.png)

* 循环渲染

![image-20231004145956183](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004145956183.png)

ListItemComponent为自定义组件

* 状态改变：

![image-20231004150228429](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004150228429.png)

* 同步刷新：

![image-20231004150402109](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004150402109.png)

![image-20231004150506924](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004150506924.png)

组件状态管理装饰器和@Builder装饰器：

组件状态管理装饰器用来管理组件中的状态，它们分别是：@State、@Prop、@Link。

- [@State](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-state-0000001474017162-V3)装饰的变量是组件内部的状态数据，当这些状态数据被修改时，将会调用所在组件的build方法进行UI刷新。
- [@Prop](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-prop-0000001473537702-V3)与@State有相同的语义，但初始化方式不同。@Prop装饰的变量必须使用其父组件提供的@State变量进行初始化，允许组件内部修改@Prop变量，但更改不会通知给父组件，即@Prop属于单向数据绑定。
- [@Link](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-link-0000001524297305-V3)装饰的变量可以和父组件的@State变量建立双向数据绑定，需要注意的是：@Link变量不能在组件内部进行初始化。
- [@Builder](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-builder-0000001524176981-V3)装饰的方法用于定义组件的声明式UI描述，在一个自定义组件内快速生成多个布局内容。







**ArkUI完整的开发范式可参考这里：**

https://developer.harmonyos.com/cn/docs/documentation/doc-guides/arkui-overview-0000001281480754

# 5 下一步演进

接下来，除UI框架需求之外，ArkTS也会结合应用开发及运行的其他方面需求持续演进：

**1. 更完善的类型系统**

我们已经设计并实现了专门运行时，利用ArkTS的类型输入，在程序执行一开始就获得较高的运行性能（不像其它传统JS引擎需要预热才能获取高性能）。但是目前的类型系统在运行时的设计上仍然考虑了兼容模式，即在运行时，当对象类型发生变化时会走Bailout机制，以使程序在类型不匹配时仍能正常运行。一种更极致的方式是：引入一种特定模式来支持确定类型的表达，当开发者可以明确类型时，提供相应的信息，这样运行时可以通过针对性设计，进一步提升性能体验。另外，ArkTS将来也会在类型系统中拓展一些新的类型，在与运行时结合的优化中会提供更好的性能体验。

**2. 更灵活的并行化处理**

目前的移动设备基本都是多核设备（包括同一配置的多核以及不同配置的大小核），有些设备还会携带多种计算芯片（CPU/GPU/NPU/...）。语言在并发特性上如何充分应用多核设备甚至异构芯片是一个重要的课题。目前我们采用的仍然是业界常见的类Actor模型的并发接口——Worker，它弥补了Actor模型的些许劣势，即允许用户转移和共享大量的Buffer以避免通信时拷贝的开销。但是开发者仍需自己去管理Worker的生命周期，利用Worker也不能非常方便地触发一个异步并行任务。我们已经在尝试在Actor模型上封装一种任务接口，方便用户更容易利用多核触发异步并行任务。我们也一直在关注Swift、Dart、Kotlin、Go这些语言并发特性的发展和运行时的实现，ArkTS的特定模式中静态类型模型的引入也会给并发机制带来更多高性能实现的可能性，比如对象的冻结、所有权转移、值语义等等。我们将持续致力于提供简洁高效的并发API，帮助应用开发者更容易开发出高性能的应用。

当然，ArkTS以及ArkUI开发框架还很年轻，还有很多其它方面也会持续演进，比如UI自定义能力的进一步完善，语言运行时以及跨语言交互的进一步优化，跨OS平台能力的扩展，分布式开发范式等等。

作为应用生态的底座，应用开发框架的创新永无止境。我们希望和广大的开发者一起，持续围绕着开发效率、运行体验、跨设备/跨平台等相关方面一起合作，一起创新，共建繁荣的应用生态。







# 声明式UI基本概念

应用界面是由一个个页面组成，ArkTS是由ArkUI框架提供，用于以声明式开发范式开发界面的语言。

声明式UI构建页面的过程，其实是组合组件的过程，声明式UI的思想，主要体现在两个方面：

- 描述UI的呈现结果，而不关心过程
- 状态驱动视图更新

类似苹果的SwiftUI中通过组合视图View，安卓Jetpack Compose中通过组合@Composable函数，ArkUI作为HarmonyOS应用开发的UI开发框架，其使用ArkTS语言构建自定义组件，通过组合自定义组件完成页面的构建。

## 自定义组件的组成

ArkTS通过struct声明组件名，并通过@Component和@Entry装饰器，来构成一个自定义组件。

使用@Entry和@Component装饰的自定义组件作为页面的入口，会在页面加载时首先进行渲染。

```typescript
@Entry
@Componentstruct ToDoList {...}
```

例如ToDoList组件对应如下整个代办页面。

**图1** ToDoList待办列表
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095806.98989304597628711585478518998133:50001231000000:2800:C24A88963BCA0746465828A1585E08F50B8076FBE561A14DF63DA8E0783563FC.png?needInitFileName=true?needInitFileName=true)

使用@Component装饰的自定义组件，如ToDoItem这个自定义组件则对应如下内容，作为页面的组成部分。

```typescript
@Component
struct ToDoItem {...}
```

**图2** ToDoItem
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095806.70650326811367194086433422357008:50001231000000:2800:9797517A1D28C1C89A68593287208AE4636571735CECEA403D730B24F48FE71D.png?needInitFileName=true?needInitFileName=true)

在自定义组件内需要使用build方法来进行UI描述。

```typescript
@Entry
@Component
 struct ToDoList
   ...
   build() {
    ...
  } 
}
```

build方法内可以容纳内置组件和其他自定义组件，如Column和Text都是内置组件，由ArkUI框架提供，ToDoItem为自定义组件，需要开发者使用ArkTS自行声明。

```typescript
@Entry
@Component
struct ToDoList {
  ...
  build() {
    Column(...) {
      Text(...)
        ...
      ForEach(...{
        TodoItem(...)
      },...)
    }
  ...
  }
}
```

## 配置属性与布局

自定义组件的组成使用基础组件和容器组件等内置组件进行组合。但有时内置组件的样式并不能满足我们的需求，ArkTS提供了属性方法用于描述界面的样式。属性方法支持以下使用方式：

- 常量传递

  例如使用fontSize(50)来配置字体大小。

  ```typescript
  Text('Hello World')
    .fontSize(50)
  ```

- 变量传递

  在组件内定义了相应的变量后，例如组件内部成员变量size，就可以使用this.size方式使用该变量。

  ```typescript
  Text('Hello World')
    .fontSize(this.size)
  ```

- 链式调用

  在配置多个属性时，ArkTS提供了链式调用的方式，通过'.'方式连续配置。

  ```typescript
  Text('Hello World')
    .fontSize(this.size)
    .width(100)
    .height(100)
  ```

- 表达式传递

  属性中还可以传入普通表达式以及三目运算表达式。

  ```typescript
  Text('Hello World')
    .fontSize(this.size)
    .width(this.count + 100)
    .height(this.count % 2 === 0 ? 100 : 200)
  ```

- 内置枚举类型

  除此之外，ArkTS中还提供了内置枚举类型，如Color，FontWeight等，例如设置fontColor改变字体颜色为红色，并私有fontWeight为加粗。

  ```typescript
  Text('Hello World')
    .fontSize(this.size)
    .width(this.count + 100)
    .height(this.count % 2 === 0 ? 100 : 200)
    .fontColor(Color.Red)
    .fontWeight(FontWeight.Bold)
  ```

对于有多种组件需要进行组合时，容器组件则是描述了这些组件应该如何排列的结果。

ArkUI中的布局容器有很多种，在不同的适用场合选择不同的布局容器实现，ArkTS使用容器组件采用花括号语法，内部放置UI描述。

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095806.20438726877186368889861981511945:50001231000000:2800:30887D22C73F25EAE7A6CF5FF1ABBD9A87DB0E0E570B4EF9278AD55660B47513.png?needInitFileName=true?needInitFileName=true)

这里我们将介绍最基础的两个布局——列布局和行布局。

对于如下每一项的布局，两个元素为横向排列，选择Row布局

**图3** Row布局
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095807.82739632860547547816563386590866:50001231000000:2800:4FC241490CB30958B3BBBE477A471BEC9FDCDFE908667AE15977653D6EE6B890.png?needInitFileName=true?needInitFileName=true)

```typescript
Row() {
  Image($r('app.media.ic_default'))
    ...
  Text(this.content) 
    ...
}
...
```

类似下图所示的布局，整体都是从上往下纵向排列，适用的布局方式是Column列布局。

**图4** Column布局
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095807.64071686986772820077308829939779:50001231000000:2800:CE428EF1E729667A903A96C498EDD6C220692F2293E1CC42C6BE120057179033.png?needInitFileName=true?needInitFileName=true)

```typescript
Column() {
   Text($r('app.string.page_title'))
     ...

   ForEach(this.totalTasks,(item) => {
     TodoItem({content:item})
   },...)
 }
```

![image-20231004155432930](%E6%B5%85%E6%9E%90ArkTS%E7%9A%84%E8%B5%B7%E6%BA%90%E5%92%8C%E6%BC%94%E8%BF%9B/image-20231004155432930.png)

## 改变组件状态

实际开发中由于交互，页面的内容可能需要产生变化，以每一个ToDoItem为例，其在完成时的状态与未完成时的展示效果是不一样的。

**图5** 不同状态的视图
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095807.16308183046758553581077323299407:50001231000000:2800:7378AF74DE74B299D02D5AAF0FBC71FE78597C01B3DE04A961F611273980A9EE.png?needInitFileName=true?needInitFileName=true)

声明式UI的特点就是UI是随数据更改而自动刷新的，我们这里定义了一个类型为boolean的变量isComplete，其被@State装饰后，框架内建立了数据和视图之间的绑定，其值的改变影响UI的显示。

```typescript
@State isComplete : boolean = false;
```

**图6** @State装饰器的作用
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095807.63166434605292363033167469936539:50001231000000:2800:43BFA92342FAB78115EBEA45450B6C9514B7ED9DDD0AF846D7E815D5E92E8654.png?needInitFileName=true?needInitFileName=true)

用圆圈和对勾这样两个图片，分别来表示该项是否完成，这部分涉及到内容的切换，需要使用条件渲染if / else语法来进行组件的显示与消失，当判断条件为真时，组件为已完成的状态，反之则为未完成。

```typescript
if (this.isComplete) {
  Image($r('app.media.ic_ok'))
    .objectFit(ImageFit.Contain)
    .width($r('app.float.checkbox_width'))
    .height($r('app.float.checkbox_width'))
    .margin($r('app.float.checkbox_margin'))
} else {
  Image($r('app.media.ic_default'))
    .objectFit(ImageFit.Contain)
    .width($r('app.float.checkbox_width'))
    .height($r('app.float.checkbox_width'))
    .margin($r('app.float.checkbox_margin'))
}
```

由于两个Image的实现具有大量重复代码，ArkTS提供了@Builder装饰器，来修饰一个函数，快速生成布局内容，从而可以避免重复的UI描述内容。这里使用@Bulider声明了一个labelIcon的函数，参数为url，对应要传给Image的图片路径。

```typescript
@Builder labelIcon(url) {
  Image(url)
    .objectFit(ImageFit.Contain)
    .width($r('app.float.checkbox_width'))
    .height($r('app.float.checkbox_width'))
    .margin($r('app.float.checkbox_margin'))
}
```

使用时只需要使用this关键字访问@Builder装饰的函数名，即可快速创建布局。

```typescript
if (this.isComplete) {
  this.labelIcon($r('app.media.ic_ok'))
} else {
  this.labelIcon($r('app.media.ic_default'))
}
```

为了让待办项带给用户的体验更符合已完成的效果，给内容的字体也增加了相应的样式变化，这里使用了三目运算符来根据状态变化修改其透明度和文字样式，如opacity是控制透明度，decoration是文字是否有划线。通过isComplete的值来控制其变化。

```typescript
Text(this.content)
  ...
  .opacity(this.isComplete ? CommonConstants.OPACITY_COMPLETED : CommonConstants.OPACITY_DEFAULT)
  .decoration({ type: this.isComplete ? TextDecorationType.LineThrough : TextDecorationType.None })
```

最后，为了实现与用户交互的效果，在组件上添加了onClick点击事件，当用户点击该待办项时，数据isComplete的更改就能够触发UI的更新。

```typescript
@Component
struct ToDoItem {
  @State isComplete : boolean = false;
  @Builder labelIcon(icon) {...}
  ...
  build() {
    Row() {
      if (this.isComplete) {
        this.labelIcon($r('app.media.ic_ok'))
      } else {
        this.labelIcon($r('app.media.ic_default'))
      }
      ... 
    }
    ...
    .onClick(() => {
      this.isComplete= !this.isComplete;
     })
  }
}
```

## 循环渲染列表数据

刚刚只是完成了一个ToDoItem组件的开发，当我们有多条待办数据需要显示在页面时，就需要使用到ForEach循环渲染语法。

例如这里我们有五条待办数据需要展示在页面上。

```typescript
total_Tasks:Array<string> = [
  '早起晨练',
  '准备早餐',
  '阅读名著',
  '学习ArkTS',
  '看剧放松'
]
```

ForEach基本使用中，只需要了解要渲染的数据以及要生成的UI内容两个部分，例如这里要渲染的数组为以上的五条待办事项，要渲染的内容是ToDoItem这个自定义组件，也可以是其他内置组件。

**图7** ForEach基本使用
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095807.59151385932116777982352271823301:50001231000000:2800:1162E732BF34071AA3077EDCC7E32C9E5FCB1542972E867A5484DEAFCDD9444D.png?needInitFileName=true?needInitFileName=true)

ToDoItem这个自定义组件中，每一个ToDoItem要显示的文本参数content需要外部传入，参数传递使用花括号的形式，用content接受数组内的内容项item。

最终完成的代码及其效果如下。

```typescript
@Entry
@Component
struct ToDoList {
   ...
   build() {
     Row() {
       Column() {
         Text(...)
           ...
         ForEach(this.totalTasks,(item) => {
           TodoItem({content:item})
         },...)
       }
       .width('100%')
     }
     .height('100%')
   }
 }
```

**图8** ToDoList页面
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095807.41980763760353693205545347622754:50001231000000:2800:43CBD8180AD6A066680C7EF37293CEFFEC3F37F88349232689A529DB9B7CE394.png?needInitFileName=true?needInitFileName=true)

[Codelabs: 分享知识与见解，一起探索HarmonyOS的独特魅力。 - Gitee.com](https://gitee.com/harmonyos/codelabs/tree/master/ToDoListArkTS)