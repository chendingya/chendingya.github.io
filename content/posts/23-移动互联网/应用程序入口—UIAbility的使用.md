---
title: 应用程序入口—UIAbility的使用
date: 2023-10-04 16:40:36
tags: openharmony
categories: openharmony
---



# 应用程序入口—UIAbility的使用

## UIAbility概述

UIAbility是一种包含用户界面的应用组件，主要用于和用户进行交互。UIAbility也是系统调度的单元，为应用提供窗口在其中绘制界面。

每一个UIAbility实例，都对应于一个最近任务列表中的任务。

一个应用可以有一个UIAbility，也可以有多个UIAbility，如下图所示。例如浏览器应用可以通过一个UIAbility结合多页面的形式让用户进行的搜索和浏览内容；而聊天应用增加一个“外卖功能”的场景，则可以将聊天应用中“外卖功能”的内容独立为一个UIAbility，当用户打开聊天应用的“外卖功能”，查看外卖订单详情，此时有新的聊天消息，即可以通过最近任务列表切换回到聊天窗口继续进行聊天对话。

一个UIAbility可以对应于多个页面，建议将一个独立的功能模块放到一个UIAbility中，以多页面的形式呈现。例如新闻应用在浏览内容的时候，可以进行多页面的跳转使用。

**图1** 单UIAbility应用和多UIAbility应用

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095811.77064551483283926643659550249754:50001231000000:2800:7845655B8290AFECD835B23767C3C125EDD350D67E802F4B9D792B8604C1B14C.png?needInitFileName=true?needInitFileName=true)

## UIAbility内页面的跳转和数据传递

UIAbility的数据传递包括有UIAbility内页面的跳转和数据传递、UIAbility间的数据跳转和数据传递，本章节主要讲解UIAbility内页面的跳转和数据传递。

在一个应用包含一个UIAbility的场景下，可以通过新建多个页面来实现和丰富应用的内容。这会涉及到UIAbility内页面的新建以及UIAbility内页面的跳转和数据传递。

## 页面的创建与跳转

打开DevEco Studio，选择一个Empty Ability工程模板，创建一个工程，例如命名为MyApplication。

- 在src/main/ets/entryability目录下，初始会生成一个UIAbility文件EntryAbility.ts。可以在EntryAbility.ts文件中根据业务需要实现UIAbility的生命周期回调内容。
- 在src/main/ets/pages目录下，会生成一个Index页面。这也是基于UIAbility实现的应用的入口页面。可以在Index页面中根据业务需要实现入口页面的功能。
- 在src/main/ets/pages目录下，右键，新建一个Second页面，用于实现页面间的跳转和数据传递。

为了实现页面的跳转和数据传递，需要新建一个页面。在原有Index页面的基础上，新建一个页面，例如命名为Second.ets。

页面间的导航可以通过页面路由router模块来实现。

页面路由模块根据页面url找到目标页面，从而实现跳转。通过页面路由模块，可以使用不同的url访问不同的页面，包括跳转到UIAbility内的指定页面、用UIAbility内的某个页面替换当前页面、返回上一页面或指定的页面等。具体使用方法请参见[ohos.router (页面路由)](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/js-apis-router-0000001478061893-V3?catalogVersion=V3)。

![image-20231004165114290](%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E5%85%A5%E5%8F%A3%E2%80%94UIAbility%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004165114290.png)

### 页面跳转和参数接收

在使用页面路由之前，需要先导入router模块，如下代码所示。

```typescript
import router from '@ohos.router';
```

页面跳转的几种方式，根据需要选择一种方式跳转即可。

- 方式一：API9及以上，router.pushUrl()方法新增了mode参数，可以将mode参数配置为router.RouterMode.Single单实例模式和router.RouterMode.Standard多实例模式。

  在单实例模式下：如果目标页面的url在页面栈中已经存在同url页面，离栈顶最近同url页面会被移动到栈顶，移动后的页面为新建页，原来的页面仍然存在栈中，页面栈的元素数量不变；如果目标页面的url在页面栈中不存在同url页面，按多实例模式跳转，页面栈的元素数量会加1。

  说明

  当页面栈的元素数量较大或者超过32时，可以通过调用router.clear()方法清除页面栈中的所有历史页面，仅保留当前页面作为栈顶页面。

  ```typescript
  router.pushUrl({
    url: 'pages/Second',
    params: {
      src: 'Index页面传来的数据',
    }
  }, router.RouterMode.Single)
  ```

- 方式二：API9及以上，router.replaceUrl()方法新增了mode参数，可以将mode参数配置为router.RouterMode.Single单实例模式和router.RouterMode.Standard多实例模式。

  在单实例模式下：如果目标页面的url在页面栈中已经存在同url页面，离栈顶最近同url页面会被移动到栈顶，替换当前页面，并销毁被替换的当前页面，移动后的页面为新建页，页面栈的元素数量会减1；如果目标页面的url在页面栈中不存在同url页面，按多实例模式跳转，页面栈的元素数量不变。

  ```typescript
  router.pushUrl({
    url: 'pages/Second', 
    params: {
      src: 'Index页面传来的数据',
    }
  }, router.RouterMode.Single)
  ```

已经实现了页面的跳转，接下来，在Second页面中如何进行自定义参数的接收呢？

通过调用router.getParams()方法获取Index页面传递过来的自定义参数。

```typescript
import router from '@ohos.router';

@Entry
@Component
struct Second {
  @State src: string = router.getParams()?.['src'];
  // 页面刷新展示
  ...
}
```

效果示意如下图所示。在Index页面中，点击“Next”后，即可从Index页面跳转到Second页面，并在Second页面中接收参数和进行页面刷新展示。

![image-20231004165134341](%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E5%85%A5%E5%8F%A3%E2%80%94UIAbility%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004165134341.png)

**图2** Index页面跳转到Second页面

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.22590038240821735570325344508710:50001231000000:2800:2BC6CD3D96BB0DEEB99EF45836FBDDE7442D4C82E931AC647510D8185B601F1E.png?needInitFileName=true?needInitFileName=true)

### 页面返回和参数接收



经常还会遇到一个场景，在Second页面中，完成了一些功能操作之后，希望能返回到Index页面，那我们要如何实现呢？

在Second页面中，可以通过调用router.back()方法实现返回到上一个页面，或者在调用router.back()方法时增加可选的options参数（增加url参数）返回到指定页面。

说明

- 调用router.back()返回的目标页面需要在页面栈中存在才能正常跳转。
- 例如调用router.pushUrl()方法跳转到Second页面，在Second页面可以通过调用router.back()方法返回到上一个页面。
- 例如调用router.clear()方法清空了页面栈中所有历史页面，仅保留当前页面，此时则无法通过调用router.back()方法返回到上一个页面。

- 返回上一个页面。

  ```typescript
  router.back();
  ```

- 返回到指定页面。

  ```typescript
  router.back({ url: 'pages/Index' });
  ```

效果示意如下图所示。在Second页面中，点击“Back”后，即可从Second页面返回到Index页面。

**图3** Second页面返回到Index页面

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.35091062726151595996874266061925:50001231000000:2800:09884775B2C3B120C79AE76A4954E4AD36E785B3CBF476A3EEECEEEBA380750D.png?needInitFileName=true?needInitFileName=true)

页面返回可以根据业务需要增加一个询问对话框。

即在调用router.back()方法之前，可以先调用router.enableBackPageAlert()方法开启页面返回询问对话框功能。

说明

- router.enableBackPageAlert()方法开启页面返回询问对话框功能，只针对当前页面生效。例如在调用router.pushUrl()或者router.replaceUrl()方法，跳转后的页面均为新建页面，因此在页面返回之前均需要先调用router.enableBackPageAlert()方法之后，页面返回询问对话框功能才会生效。
- 如需关闭页面返回询问对话框功能，可以通过调用router.disableAlertBeforeBackPage()方法关闭该功能即可。

```typescript
router.enableBackPageAlert({
  message: 'Message Info'
});

router.back();
```

在Second页面中，调用router.back()方法返回上一个页面或者返回指定页面时，根据需要继续增加自定义参数，例如在返回时增加一个自定义参数src。

```typescript
router.enableBackPageAlert({
  message: 'Message Info'
});

router.back();
```

从Second页面返回到Index页面。在Index页面通过调用router.getParams()方法，获取Second页面传递过来的自定义参数。

说明

**调用router.back()方法，不会新建页面，返回的是原来的页面，在原来页面中@State声明的变量不会重复声明，以及也不会触发页面的aboutToAppear()生命周期回调，因此无法直接在变量声明以及页面的aboutToAppear()生命周期回调中接收和解析router.back()传递过来的自定义参数。**

可以放在业务需要的位置进行参数解析。示例代码在Index页面中的onPageShow()生命周期回调中进行参数的解析。

```typescript
import router from '@ohos.router';

@Entry
@Component
struct Index {
  @State src: string = '';

  onPageShow() {
    this.src = router.getParams()?.['src'];
  }

  // 页面刷新展示
  ...
}
```

效果示意图如下图所示。在Second页面中，点击“Back”后，即可从Second页面返回到Index页面，并在Index页面中接收参数和进行页面刷新展示。

**图4** Second页面带参数返回Index页面

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.65278488588268530339423906572602:50001231000000:2800:1AD47605D5369ADDD567F430B9EE3389F66625A227F8357A6BC9425D158F57D4.png?needInitFileName=true?needInitFileName=true)

## UIAbility的生命周期

![image-20231004165443707](%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E5%85%A5%E5%8F%A3%E2%80%94UIAbility%E7%9A%84%E4%BD%BF%E7%94%A8/image-20231004165443707.png)

当用户浏览、切换和返回到对应应用的时候，应用中的UIAbility实例会在其生命周期的不同状态之间转换。

UIAbility类提供了很多回调，通过这些回调可以知晓当前UIAbility的某个状态已经发生改变：例如UIAbility的创建和销毁，或者UIAbility发生了前后台的状态切换。

例如从桌面点击图库应用图标，到启动图库应用，应用的状态经过了从创建到前台展示的状态变化。如下图所示。

**图5** 从桌面点击图库应用图标启动应用
![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.42267986425770953521121001045606:50001231000000:2800:D9DE8F975A01F2E8ACCF2E5D6A29B430D5F13375717652868038A7ED62450FC7.png?needInitFileName=true?needInitFileName=true)

回到桌面，从最近任务列表，切换回到图库应用，应用的状态经过了从后台到前台展示的状态变化。如下图所示。

**图6** 从最近任务列表切换回到图库应用

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.44561047264683840539550478543421:50001231000000:2800:20807D480427D4C752B19E0504B3B145DA4721E42E2B7CDC2863A8190708A149.png?needInitFileName=true?needInitFileName=true)

在UIAbility的使用过程中，会有多种生命周期状态。掌握UIAbility的生命周期，对于应用的开发非常重要。

为了实现多设备形态上的裁剪和多窗口的可扩展性，系统对组件管理和窗口管理进行了解耦。UIAbility的生命周期包括Create、Foreground、Background、Destroy四个状态，WindowStageCreate和WindowStageDestroy为窗口管理器（WindowStage）在UIAbility中管理UI界面功能的两个生命周期回调，从而实现UIAbility与窗口之间的弱耦合。如下图所示。

**图7** UIAbility生命周期状态

![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.06385773421364203467644247472780:50001231000000:2800:5833D50EE7D4DF26D3B8F0A8B061D1E7CEA47239597435F93CB8BE42A44D6CCB.png?needInitFileName=true?needInitFileName=true)

- Create状态，在UIAbility实例创建时触发，系统会调用onCreate回调。可以在onCreate回调中进行相关初始化操作。

  ```typescript
  import UIAbility from '@ohos.app.ability.UIAbility'; 
  import window from '@ohos.window';
  
  export default class EntryAbility extends UIAbility {
      onCreate(want, launchParam) { 
          // 应用初始化
          ...
      }
      ...
  }
  ```

  例如用户打开电池管理应用，在应用加载过程中，在UI页面可见之前，可以在onCreate回调中读取当前系统的电量情况，用于后续的UI页面展示。

- UIAbility实例创建完成之后，在进入Foreground之前，系统会创建一个WindowStage。每一个UIAbility实例都对应持有一个WindowStage实例。

  WindowStage为本地窗口管理器，用于管理窗口相关的内容，例如与界面相关的获焦/失焦、可见/不可见。

  可以在onWindowStageCreate回调中，设置UI页面加载、设置WindowStage的事件订阅。

  在onWindowStageCreate(windowStage)中通过loadContent接口设置应用要加载的页面，Window接口的使用详见[窗口开发指导](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/application-window-stage-0000001427584712-V3?catalogVersion=V3)。

  ```typescript
  import UIAbility from '@ohos.app.ability.UIAbility'; 
  import window from '@ohos.window';
  
  export default class EntryAbility extends UIAbility {
      ...
  
      onWindowStageCreate(windowStage: window.WindowStage) {
          // 设置UI页面加载
          // 设置WindowStage的事件订阅（获焦/失焦、可见/不可见）
          ...
  
          windowStage.loadContent('pages/Index', (err, data) => { 
              ...
          });
      }
      ...
  }
  ```

  例如用户打开游戏应用，正在打游戏的时候，有一个消息通知，打开消息，消息会以弹窗的形式弹出在游戏应用的上方，此时，游戏应用就从获焦切换到了失焦状态，消息应用切换到了获焦状态。对于消息应用，在onWindowStageCreate回调中，会触发获焦的事件回调，可以进行设置消息应用的背景颜色、高亮等操作。

- Foreground和Background状态，分别在UIAbility切换至前台或者切换至后台时触发。

  分别对应于onForeground回调和onBackground回调。

  onForeground回调，在UIAbility的UI页面可见之前，即UIAbility切换至前台时触发。可以在onForeground回调中申请系统需要的资源，或者重新申请在onBackground中释放的资源。

  onBackground回调，在UIAbility的UI页面完全不可见之后，即UIAbility切换至后台时候触发。可以在onBackground回调中释放UI页面不可见时无用的资源，或者在此回调中执行较为耗时的操作，例如状态保存等。

  ```typescript
  import UIAbility from '@ohos.app.ability.UIAbility';
  import window from '@ohos.window';
  
  export default class EntryAbility extends UIAbility {
      ...
  
      onForeground() {
          // 申请系统需要的资源，或者重新申请在onBackground中释放的资源
          ...
      }
  
      onBackground() {
          // 释放UI页面不可见时无用的资源，或者在此回调中执行较为耗时的操作
          // 例如状态保存等
          ...
      }
  }
  ```

  例如用户打开地图应用查看当前地理位置的时候，假设地图应用已获得用户的定位权限授权。在UI页面显示之前，可以在onForeground回调中打开定位功能，从而获取到当前的位置信息。

  当地图应用切换到后台状态，可以在onBackground回调中停止定位功能，以节省系统的资源消耗。

- 前面我们了解了UIAbility实例创建时的onWindowStageCreate回调的相关作用。

  对应于onWindowStageCreate回调。在UIAbility实例销毁之前，则会先进入onWindowStageDestroy回调，我们可以在该回调中释放UI页面资源。

  ```typescript
  import UIAbility from '@ohos.app.ability.UIAbility';
  import window from '@ohos.window';
  
  export default class EntryAbility extends UIAbility {
      ...
  
      onWindowStageDestroy() {
          // 释放UI页面资源
          ...
      }
  }
  ```

  例如在onWindowStageCreate中设置的获焦/失焦等WindowStage订阅事件。

- Destroy状态，在UIAbility销毁时触发。可以在onDestroy回调中进行系统资源的释放、数据的保存等操作。

  ```typescript
  import UIAbility from '@ohos.app.ability.UIAbility'; 
  import window from '@ohos.window';
  
  export default class EntryAbility extends UIAbility {
    ...
  
      onDestroy() { 
          // 系统资源的释放、数据的保存等
          ...
      }
  }
  ```
  
  例如用户使用应用的程序退出功能，会调用UIAbilityContext的terminalSelf()方法，从而完成UIAbility销毁。或者用户使用最近任务列表关闭该UIAbility实例时，也会完成UIAbility的销毁。

## UIAbility的启动模式



对于浏览器或者新闻等应用，用户在打开该应用，并浏览访问相关内容后，回到桌面，再次打开该应用，显示的仍然是用户当前访问的界面。

对于应用的分屏操作，用户希望使用两个不同应用（例如备忘录应用和图库应用）之间进行分屏，也希望能使用同一个应用（例如备忘录应用自身）进行分屏。

对于文档应用，用户从文档应用中打开一个文档内容，回到文档应用，继续打开同一个文档，希望打开的还是同一个文档内容。

基于以上场景的考虑，UIAbility当前支持singleton（单实例模式）、multiton（多实例模式）和specified（指定实例模式）3种启动模式。

对启动模式的详细说明如下：

- singleton（单实例模式）

  当用户打开浏览器或者新闻等应用，并浏览访问相关内容后，回到桌面，再次打开该应用，显示的仍然是用户当前访问的界面。

  这种情况下可以将UIAbility配置为singleton（单实例模式）。每次调用startAbility()方法时，如果应用进程中该类型的UIAbility实例已经存在，则复用系统中的UIAbility实例，系统中只存在唯一一个该UIAbility实例。

  即在最近任务列表中只存在一个该类型的UIAbility实例。

  ![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095812.40883045486310369695600230977595:50001231000000:2800:DB3055D06B6130255DB8CE9E62CF7D81CBBA9B0A37F5508F863F8F80B3E907A5.png?needInitFileName=true?needInitFileName=true)

- multiton（多实例模式）

  用户在使用分屏功能时，希望使用两个不同应用（例如备忘录应用和图库应用）之间进行分屏，也希望能使用同一个应用（例如备忘录应用自身）进行分屏。

  这种情况下可以将UIAbility配置为multiton（多实例模式）。每次调用startAbility()方法时，都会在应用进程中创建一个该类型的UIAbility实例。

  即在最近任务列表中可以看到有多个该类型的UIAbility实例。

  ![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095813.01600395736656850519596227417847:50001231000000:2800:AEE1FFF319D03640E1F4F773A4765C6F2D919536C342D6CCEC2731A1BE1DA9BF.gif?needInitFileName=true?needInitFileName=true)

- specified（指定实例模式）

  用户打开文档应用，从文档应用中打开一个文档内容，回到文档应用，继续打开同一个文档，希望打开的还是同一个文档内容；以及在文档应用中新建一个新的文档，每次新建文档，希望打开的都是一个新的空白文档内容。

  这种情况下可以将UIAbility配置为specified（指定实例模式）。在UIAbility实例新创建之前，允许开发者为该实例创建一个字符串Key，新创建的UIAbility实例绑定Key之后，后续每次调用startAbility方法时，都会询问应用使用哪个Key对应的UIAbility实例来响应startAbility请求。如果匹配有该UIAbility实例的Key，则直接拉起与之绑定的UIAbility实例，否则创建一个新的UIAbility实例。运行时由UIAbility内部业务决定是否创建多实例。

  ![点击放大](https://alliance-communityfile-drcn.dbankcdn.com/FileServer/getFile/cmtyPub/011/111/111/0000000000011111111.20230825095813.68359630496648251226453082420443:50001231000000:2800:5E8B46D30A119F3D0CB316621A189F17E0CED6426C09768FE7AF99D8759AAACF.png?needInitFileName=true?needInitFileName=true)

### singleton启动模式



singleton启动模式，也是默认情况下的启动模式。

singleton启动模式，每次调用startAbility()启动UIAbility时，如果应用进程中该类型的UIAbility实例已经存在，则复用系统中的UIAbility实例，系统中只存在唯一一个该UIAbility实例。

singleton启动模式的开发使用，在module.json5文件中的“launchType”字段配置为“singleton”即可。

```typescript
{
   "module": {
     ...
     "abilities": [
       {
         "launchType": "singleton",
         ...
       }
     ]
  }
}
```

### multiton启动模式



multiton启动模式，每次调用startAbility()方法时，都会在应用进程中创建一个该类型的UIAbility实例。

multiton启动模式的开发使用，在module.json5文件中的“launchType”字段配置为“multiton”即可。

```typescript
{
   "module": {
     ...
     "abilities": [
       {
         "launchType": "multiton",
         ...
       }
     ]
  }
}
```

### specified启动模式



specified启动模式，根据业务需要是否创建一个新的UIAbility实例。在UIAbility实例创建之前，会先进入AbilityStage的onAcceptWant回调，在onAcceptWant回调中为每一个UIAbility实例创建一个Key，后续每次调用startAbility()方法创建该类型的UIAbility实例都会询问使用哪个Key对应的UIAbility实例来响应startAbility()请求。

specified启动模式的开发使用的步骤如下所示。

1. 在module.json5文件中的“launchType”字段配置为“specified”。

   ```typescript
   {
      "module": {
        ...
        "abilities": [
          {
            "launchType": "specified",
            ...
          }
        ]
     }
   }
   ```

2. 在调用startAbility()方法的want参数中，增加一个自定义参数来区别UIAbility实例，例如增加一个“instanceKey”自定义参数。

   ```typescript
   // 在启动指定实例模式的UIAbility时，给每一个UIAbility实例配置一个独立的Key标识
   function getInstance() {
       ...
   }
   
   let want = { 
       deviceId: "", // deviceId为空表示本设备
       bundleName: "com.example.myapplication",
       abilityName: "MainAbility",
       moduleName: "device", // moduleName非必选，默认为当前UIAbility所在的Module
       parameters: { // 自定义信息
           instanceKey: getInstance(),
       },
   }
   // context为启动方UIAbility的AbilityContext
   context.startAbility(want).then(() => { 
       ...
   }).catch((err) => {
       ...
   })
   ```

3. 在被拉起方UIAbility对应的AbilityStage的onAcceptWant生命周期回调中，解析传入的want参数，获取“instanceKey”自定义参数。根据业务需要返回一个该UIAbility实例的字符串Key标识。如果之前启动过此Key标识的UIAbility，则会将之前的UIAbility拉回前台并获焦，而不创建新的实例，否则创建新的实例并启动。

   ```typescript
   onAcceptWant(want): string {
       // 在被启动方的AbilityStage中，针对启动模式为specified的UIAbility返回一个UIAbility实例对应的一个Key值
       // 当前示例指的是device Module的EntryAbility
   if (want.abilityName === 'MainAbility') {
           return `DeviceModule_MainAbilityInstance_${want.parameters.instanceKey}`;
    }
   
    return '';
   }
   ```
   
   例如在文档应用中，可以对不同的文档实例内容绑定不同的Key值。当每次新建文档的时候，可以传入不同的新Key值（如可以将文件的路径作为一个Key标识），此时AbilityStage中启动UIAbility时都会创建一个新的UIAbility实例；当新建的文档保存之后，回到桌面，或者新打开一个已保存的文档，回到桌面，此时再次打开该已保存的文档，此时AbilityStage中再次启动该UIAbility时，打开的仍然是之前原来已保存的文档界面。
   
   操作举例如下表所示。
   
   | 操作序号 | 文档内容                                     | UIAbility实例      |
   | -------- | -------------------------------------------- | ------------------ |
   | 1        | 打开文件A                                    | 对应UIAbility实例1 |
   | 2        | 关闭打开文件A的进程，回到桌面，再次打开文件A | 对应UIAbility实例2 |
   | 3        | 打开文件B                                    | 对应UIAbility实例3 |
   | 4        | 再次打开文件A                                | 对应UIAbility实例2 |

## 参考链接

- [ohos.router (页面路由)](https://developer.harmonyos.com/cn/docs/documentation/doc-references-V3/js-apis-router-0000001478061893-V3?catalogVersion=V3)