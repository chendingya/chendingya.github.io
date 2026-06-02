---
title: List组件和Grid组件的使用
date: 2023-10-04 11:40:36
tags: openharmony
categories: openharmony

---



# List组件和Grid组件的使用

## 简介



在我们常用的手机应用中，经常会见到一些数据列表，如设置页面、通讯录、商品列表等。下图中两个页面都包含列表，“首页”页面中包含两个网格布局，“商城”页面中包含一个商品列表。

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095822.24077778724327014108147812126536:50001231000000:2800:62F1699773267B30AC87345AB062C4DC00D54879ACB475D64CA68A2F61C00D6C.png?needInitFileName=true?needInitFileName=true)

上图中的列表中都包含一系列相同宽度的列表项，连续、多行呈现同类数据，例如图片和文本。常见的列表有线性列表（List列表）和网格布局（Grid列表）：

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095822.37477565095245015492124558376450:50001231000000:2800:631039542AF3449BBF9B20E61F619B6F5C4B30AEE101CA9F9A4DBDB2A199B74D.png?needInitFileName=true?needInitFileName=true)

为了帮助开发者构建包含列表的应用，ArkUI提供了List组件和Grid组件，开发者使用List和Grid组件能够很轻松的完成一些列表页面。

## List组件的使用

![image-20231004190216428](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190216428.png)

![image-20231004190205499](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190205499.png)

![image-20231004190152803](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190152803.png)

![image-20231004190128437](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190128437.png)

### List组件简介



List是很常用的滚动类容器组件，一般和子组件ListItem一起使用，List列表中的每一个列表项对应一个ListItem组件。

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095822.87385221822490631824670098711536:50001231000000:2800:6C4FEA38667A880B275DC66D78FD0A287C928C83B4EBCB01BA83BBEA8900DF7D.png?needInitFileName=true?needInitFileName=true)

### 使用ForEeach渲染列表



列表往往由多个列表项组成，所以我们需要在List组件中使用多个ListItem组件来构建列表，这就会导致代码的冗余。使用循环渲染（ForEach）遍历数组的方式构建列表，可以减少重复代码，示例代码如下：

```typescript
@Entry
@Component
struct ListDemo {
  private arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  build() {
    Column() {
      List({ space: 10 }) {
        ForEach(this.arr, (item: number) => {
          ListItem() {
            Text(`${item}`)
              .width('100%')
              .height(100)
              .fontSize(20)
              .fontColor(Color.White)
              .textAlign(TextAlign.Center)
              .borderRadius(10)
              .backgroundColor(0x007DFF)
          }
        }, item => item)
      }
    }
    .padding(12)
    .height('100%')
    .backgroundColor(0xF1F3F5)
  }
}
```

效果图如下：

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095822.46207106859819979473871877825480:50001231000000:2800:4AEB572F64E4ED040224DB51A011FE6828CFA4E2F071BA8B4AE3F62183E147A8.png?needInitFileName=true?needInitFileName=true)

### 设置列表分割线



List组件子组件ListItem之间默认是没有分割线的，部分场景子组件ListItem间需要设置分割线，这时候您可以使用List组件的divider属性。divider属性包含四个参数：

- strokeWidth: 分割线的线宽。

- color: 分割线的颜色。

- startMargin：分割线距离列表侧边起始端的距离。

- endMargin: 分割线距离列表侧边结束端的距离。

  ![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095822.13891928276254988507260489161550:50001231000000:2800:4C1C3A3431AA88552A77D95D5F270ED723C32FB1365CDC69AA56A6A87F183EF3.png?needInitFileName=true?needInitFileName=true)

### List列表滚动事件监听



List组件提供了一系列事件方法用来监听列表的滚动，您可以根据需要，监听这些事件来做一些操作：

- onScroll：列表滑动时触发，返回值scrollOffset为滑动偏移量，scrollState为当前滑动状态。
- onScrollIndex：列表滑动时触发，返回值分别为滑动起始位置索引值与滑动结束位置索引值。
- onReachStart：列表到达起始位置时触发。
- onReachEnd：列表到底末尾位置时触发。
- onScrollStop：列表滑动停止时触发。

使用示例代码如下：

```typescript
List({ space: 10 }) {
  ForEach(this.arr, (item) => {
    ListItem() {
      Text(`${item}`)
        ...
    }
  }, item => item)
}
.onScrollIndex((firstIndex: number, lastIndex: number) => {
  console.info('first' + firstIndex)
  console.info('last' + lastIndex)
})
.onScroll((scrollOffset: number, scrollState: ScrollState) => {
  console.info('scrollOffset' + scrollOffset)
  console.info('scrollState' + scrollState)
})
.onReachStart(() => {
  console.info('onReachStart')
})
.onReachEnd(() => {
  console.info('onReachEnd')
})
.onScrollStop(() => {
  console.info('onScrollStop')
})
```

### 设置List排列方向



List组件里面的列表项默认是按垂直方向排列的，如果您想让列表沿水平方向排列，您可以将List组件的listDirection属性设置为Axis.Horizontal。

listDirection参数类型是[Axis](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/ts-appendix-enums-0000001478061741-V3?catalogVersion=V3#ZH-CN_TOPIC_0000001478061741__axis)，定义了以下两种类型：

- Vertical（默认值）：子组件ListItem在List容器组件中呈纵向排列。

  ![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095822.97693891504872342245205636279312:50001231000000:2800:79686A4337732C9121B7744285DD3B1CEDC602A5FFDBCFCEA8388E1E44A7A968.png?needInitFileName=true?needInitFileName=true)

- Horizontal：子组件ListItem在List容器组件中呈横向排列。

  ![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095823.60205428349154619863633529080584:50001231000000:2800:F1E28052524CF7E19731CFC170A23930F92A17B63CC95BF509E93932B686F6AA.png?needInitFileName=true?needInitFileName=true)

## Grid组件的使用

![image-20231004190717360](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190717360.png)

![image-20231004190746464](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190746464.png)

![image-20231004190835377](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190835377.png)

![image-20231004190925849](List%E7%BB%84%E4%BB%B6%E5%92%8CGrid%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004190925849.png)

### Grid组件简介

Grid组件为网格容器，是一种网格列表，由“行”和“列”分割的单元格所组成，通过指定“项目”所在的单元格做出各种各样的布局。Grid组件一般和子组件GridItem一起使用，Grid列表中的每一个条目对应一个GridItem组件。

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095823.48103037179957224444938096399589:50001231000000:2800:B0173696ED04B8275D6BADE504017C5455B8D7BED9FCA22B9857CF461DB63F0C.png?needInitFileName=true?needInitFileName=true)

### 使用ForEach渲染网格布局

和List组件一样，Grid组件也可以使用ForEach来渲染多个列表项GridItem，我们通过下面的这段示例代码来介绍Grid组件的使用。

```typescript
@Entry
@Component
struct GridExample {
  // 定义一个长度为16的数组
  private arr: string[] = new Array(16).fill('').map((_, index) => `item ${index}`);

  build() {
    Column() {
      Grid() {
        ForEach(this.arr, (item: string) => {
          GridItem() {
            Text(item)
              .fontSize(16)
              .fontColor(Color.White)
              .backgroundColor(0x007DFF)
              .width('100%')
              .height('100%')
              .textAlign(TextAlign.Center)
          }
        }, item => item)
      }
      .columnsTemplate('1fr 1fr 1fr 1fr')
      .rowsTemplate('1fr 1fr 1fr 1fr')
      .columnsGap(10)
      .rowsGap(10)
      .height(300)
    }
    .width('100%')
    .padding(12)
    .backgroundColor(0xF1F3F5)
  }
}
```

示例代码中创建了16个GridItem列表项。同时设置columnsTemplate的值为'1fr 1fr 1fr 1fr'，表示这个网格为4列，将Grid允许的宽分为4等分，每列占1份；rowsTemplate的值为'1fr 1fr 1fr 1fr'，表示这个网格为4行，将Grid允许的高分为4等分，每行占1份。这样就构成了一个4行4列的网格列表，然后使用columnsGap设置列间距为10vp，使用rowsTemplate设置行间距也为10vp。示例代码效果图如下：

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095823.80835072962157800911828459289578:50001231000000:2800:7E06C5BAFF9D0A29BBE3AC4876996563BD976C8C4D220CB56233D4B61B3D4931.png?needInitFileName=true?needInitFileName=true)

上面构建的网格布局使用了固定的行数和列数，所以构建出的网格是不可滚动的。然而有时候因为内容较多，我们通过滚动的方式来显示更多的内容，就需要一个可以滚动的网格布局。我们只需要设置rowsTemplate和columnsTemplate中的一个即可。

将示例代码中GridItem的高度设置为固定值，例如100；仅设置columnsTemplate属性，不设置rowsTemplate属性，就可以实现Grid列表的滚动：

```typescript
Grid() {
  ForEach(this.arr, (item: string) => {
    GridItem() {
      Text(item)
        .height(100)
        ...
    }
  }, item => item)
}
.columnsTemplate('1fr 1fr 1fr 1fr')
.columnsGap(10)
.rowsGap(10)
.height(300)
```

此外，Grid像List一样也可以使用onScrollIndex来监听列表的滚动。

## 列表性能优化

开发者在使用长列表时，如果直接采用循环渲染方式，会一次性加载所有的列表元素，从而导致页面启动时间过长，影响用户体验，推荐通过以下方式来进行列表性能优化：

[使用数据懒加载](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/ui-ts-performance-improvement-recommendation-0000001477981001-V3#ZH-CN_TOPIC_0000001477981001__推荐使用数据懒加载)

[设置list组件的宽高](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/ui-ts-performance-improvement-recommendation-0000001477981001-V3#ZH-CN_TOPIC_0000001477981001__设置list组件的宽高)

## 参考链接

1. List组件的相关API参考：[List组件](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/ts-container-list-0000001477981213-V3?catalogVersion=V3)。
2. Grid组件的相关API参考：[Grid组件](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/ts-container-grid-0000001478341161-V3?catalogVersion=V3)。
3. 循环渲染（ForEach）：[循环渲染](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-rendering-control-0000001427744548-V3?catalogVersion=V3#ZH-CN_TOPIC_0000001427744548__循环渲染)。