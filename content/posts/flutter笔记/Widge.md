---
title: Flutter Widge
date: 2024-7-2 18:32:34
categories: Flutter
tags: [Flutter, Dart]


---



2024.7.1

# Widge

[2.2 Widget 简介 | 《Flutter实战·第二版》 (flutterchina.club)](https://book.flutterchina.club/chapter2/flutter_widget_intro.html#_2-2-6-state)

在Flutter中几乎所有的对象都是一个 widget

我们在描述UI元素时可能会用到“控件”、“组件”这样的概念，读者心里需要知道他们就是 widget ，只是在不同场景的不同表述而已。

Flutter 中是通过 Widget 嵌套 Widget 的方式来构建UI和进行事件处理的，所以记住，Flutter 中万物皆为Widget。

`Widget`类本身是一个抽象类，其中最核心的就是定义了`createElement()`接口，在 Flutter 开发中，我们一般都不用直接继承`Widget`类来实现一个新组件，相反，我们通常会通过继承`StatelessWidget`或`StatefulWidget`来间接继承`widget`类来实现。`StatelessWidget`和`StatefulWidget`都是直接继承自`Widget`类，而这两个类也正是 Flutter 中非常重要的两个抽象类

## Flutter中的四棵树

既然 Widget 只是描述一个UI元素的配置信息，那么真正的布局、绘制是由谁来完成的呢？Flutter 框架的处理流程是这样的：

1. 根据 Widget 树生成一个 Element 树，Element 树中的节点都继承自 `Element` 类。
2. 根据 Element 树生成 Render 树（渲染树），渲染树中的节点都继承自`RenderObject` 类。
3. 根据渲染树生成 Layer 树，然后上屏显示，Layer 树中的节点都继承自 `Layer` 类。

真正的布局和渲染逻辑在 Render 树中，Element 是 Widget 和 RenderObject 的粘合剂，可以理解为一个中间代理。

```dart
Container( // 一个容器 widget
  color: Colors.blue, // 设置容器背景色
  child: Row( // 可以将子widget沿水平方向排列
    children: [
      Image.network('https://www.example.com/1.png'), // 显示图片的 widget
      const Text('A'),
    ],
  ),
);
```

注意，如果 Container 设置了背景色，Container 内部会创建一个新的 ColoredBox 来填充背景，相关逻辑如下：

```dart
if (color != null)
  current = ColoredBox(color: color!, child: current);
```

而 Image 内部会通过 RawImage 来渲染图片、Text 内部会通过 RichText 来渲染文本，所以最终的 Widget树、Element 树、渲染树结构如图2-2所示：

![图2-2](https://book.flutterchina.club/assets/img/2-2.59d95f72.png)

这里需要注意：

1. 三棵树中，Widget 和 Element 是一一对应的，但并不和 RenderObject 一一对应。比如 `StatelessWidget` 和 `StatefulWidget` 都没有对应的 RenderObject。
2. 渲染树在上屏前会生成一棵 Layer 树

## StatelessWidget

`StatelessElement` 间接继承自`Element`类，与`StatelessWidget`相对应（作为其配置数据）。

```dart
@override
StatelessElement createElement() => StatelessElement(this);
```

`StatelessWidget`用于不需要维护状态的场景，它通常在`build`方法中通过嵌套其他 widget 来构建UI，在构建过程中会递归的构建其嵌套的 widget 。

按照惯例，widget 的构造函数参数应使用命名参数，命名参数中的必需要传的参数要添加`required`关键字，这样有利于静态代码分析器进行检查；在继承 widget 时，第一个参数通常应该是`Key`。另外，如果 widget 需要接收子 widget ，那么`child`或`children`参数通常应被放在参数列表的最后。同样是按照惯例， widget 的属性应尽可能的被声明为`final`，防止被意外改变。

### Context

`build`方法有一个`context`参数，它是`BuildContext`类的一个实例，表示当前 widget 在 widget 树中的上下文，**每一个 widget 都会对应一个 context 对象（因为每一个 widget 都是 widget 树上的一个节点）**。实际上，`context`是当前 widget 在 widget 树中位置中执行”相关操作“的一个句柄(handle)，比如它提供了从当前 widget 开始向上遍历 widget 树以及按照 widget 类型查找父级 widget 的方法。

## StatefulWidget

和`StatelessWidget`一样，`StatefulWidget`也是继承自`widget`类，并重写了`createElement()`方法，不同的是返回的`Element` 对象并不相同；另外`StatefulWidget`类中添加了一个新的接口`createState()`。

看看`StatefulWidget`的类定义：

```dart
abstract class StatefulWidget extends Widget {
  const StatefulWidget({ Key key }) : super(key: key);
    
  @override
  StatefulElement createElement() => StatefulElement(this);
    
  @protected
  State createState();
}
```

- `StatefulElement` 间接继承自`Element`类，与`StatefulWidget`相对应（作为其配置数据）。**`StatefulElement`中可能会多次调用`createState()`来创建状态（State）对象**。
- `createState()` 用于创建和 StatefulWidget 相关的状态，它在StatefulWidget 的生命周期中可能会被多次调用。例如，当一个 StatefulWidget 同时插入到 widget 树的多个位置时，Flutter 框架就会调用该方法为每一个位置生成一个独立的State实例，其实，本质上就是一个`StatefulElement`对应一个State实例。

而**在StatefulWidget 中，State 对象和`StatefulElement`具有一一对应的关系**，所以在Flutter的SDK文档中，可以经常看到“从树中移除 State 对象”或“插入 State 对象到树中”这样的描述，此时的树指通过 widget 树生成的 Element 树。

## State

一个 StatefulWidget 类会对应一个 State 类，State表示与其对应的 StatefulWidget 要维护的状态，State 中的保存的状态信息可以：

1. 在 widget 构建时可以被同步读取。
2. 在 widget 生命周期中可以被改变，当State被改变时，可以手动调用其`setState()`方法通知Flutter 框架状态发生改变，Flutter 框架在收到消息后，会重新调用其`build`方法重新构建 widget 树，从而达到更新UI的目的。

State 中有两个常用属性：

1. `widget`，它表示与该 State 实例关联的 widget 实例，由Flutter 框架动态设置。注意，这种关联并非永久的，因为在应用生命周期中，UI树上的某一个节点的 widget 实例在重新构建时可能会变化，但State实例只会在第一次插入到树中时被创建，当在重新构建时，如果 widget 被修改了，Flutter 框架会动态设置State. widget 为新的 widget 实例。
2. `context`。StatefulWidget对应的 BuildContext，作用同StatelessWidget 的BuildContext。

### State生命周期

