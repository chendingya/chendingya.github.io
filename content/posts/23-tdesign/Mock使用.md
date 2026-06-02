---
title: 微信小程序中Mock使用
date: 2023-09-15 16:02:34
categories: tdesign
tags: tdesign
---

# Mock使用

## 最简单的方法

![image-20230915160408426](Mock%E4%BD%BF%E7%94%A8/image-20230915160408426.png)

数据模版

```json
{
  "data": {
    "list" : [
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} ,
      {"标题" : "视频A", "全球": "4442", "华北": "456", "华东" : "456"} 
      
     
    ]
  },
  "statusCode": 200,
  "header": {
    "content-type": "application/json; charset=utf-8"
  }
}
```

json预览

```json
// 模板生成数据预览（仅作预览，不作为API最终返回的数据）
{
  "data": {
    "list": [
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      },
      {
        "标题": "视频A",
        "全球": "4442",
        "华北": "456",
        "华东": "456"
      }
    ]
  },
  "statusCode": 200,
  "header": {
    "content-type": "application/json; charset=utf-8"
  }
}
```

## 比较复杂的方法

[Home · nuysoft/Mock Wiki (github.com)](https://github.com/nuysoft/Mock/wiki)

[cdn.bootcdn.net/ajax/libs/Mock.js/1.0.0/mock.js](https://cdn.bootcdn.net/ajax/libs/Mock.js/1.0.0/mock.js)

## 安装

```
# 安装
npm install mockjs
```

##  使用 Mock

```js
//
var Mock = require('mockjs')
var data = Mock.mock({
    // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
    'list|1-10': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1
    }]
})
// 输出结果
console.log(JSON.stringify(data, null, 4))
```

### 新建一个api文件夹

#### 新建request.js

```js
import config from "../config";

const {baseUrl} = config;
const delay = config.isMock ? 500 : 0
function request(url, method = "GET", data = {}) {
  const header = {
    "content-type": "application/json"
    // 有其他content-type需求加点逻辑判断处理即可
  }
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync("access_token");
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      dataType: "json", // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        setTimeout(() => {
          // HTTP状态码为200才视为成功
          if (res.code === 200) {
            resolve(res)
          } else {
            // wx.request的特性，只要有响应就会走success回调，所以在这里判断状态，非200的均视为请求失败
            reject(res)
          }
        }, delay)

      },
      fail(err) {
        setTimeout(() => {
          // 断网、服务器挂了都会fail回调，直接reject即可
          reject(err)
        }, delay)
      },
    })
  })
}

// 导出请求和服务地址
export default request 
```

### 新建一个mock文件夹

![image-20230915160630981](Mock%E4%BD%BF%E7%94%A8/image-20230915160630981.png)

#### 新建index.js

```js
import Mock from './WxMock'
// 导入包含path和data的对象
import loginMock from './login/index'
import homeMock from './home/index'
import dataCenter from './dataCenter/index'

export default () => {
  // 在这里添加新的mock数据
  const mockData = [
    ...loginMock,
    ...homeMock,
    ...dataCenter
  ]
  mockData.forEach(item => {
    Mock.mock(item.path, { code: 200, success: true, data: item.data })
  })
}
```

#### 新建WxMock.js

```js
/* eslint-disable */
var __request=wx.request;var Mock=require("./mock.js");Object.defineProperty(wx,"request",{writable:true});wx.request=function(config){if(typeof Mock._mocked[config.url]=="undefined"){__request(config);return}var resTemplate=Mock._mocked[config.url].template;var response=Mock.mock(resTemplate);if(typeof config.success=="function"){config.success(response)}if(typeof config.complete=="function"){config.complete(response)}};module.exports=Mock;

```

### 新建mock.js文件

可以本地新建一个`mock.js`文件

自行下载

### 新建page的mock文件夹

#### 新建get

getArea.js

```js
export default {
  path: '/dataCenter/area',
  data: {
    returnType: 'succ',
    generateType: 'template',
    manual: {
      succ: {
        resStr: {
          data: '',
          statusCode: '',
          header: '',
        },
      },
      fail: {
        resStr: {
          errMsg: 'request:fail 填写错误信息',
        },
      },
    },
    template: {
      succ: {
        data: {
          list: [
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
            {
              标题: '视频A',
              全球: '4442',
              华北: '456',
              华东: '456',
            },
          ],
        },
        statusCode: 200,
        header: {
          'content-type': 'application/json; charset=utf-8',
        },
      },
      fail: {
        templateStr: {
          errMsg: 'request:fail 填写错误信息',
        },
      },
    },
  },
};
```

getCompleteRate.js

```js
export default {
  path: '/dataCenter/complete-rate',
  data: {
    returnType: 'succ',
    generateType: 'template',
    manual: {
      succ: {
        resStr: {
          data: '',
          statusCode: '',
          header: '',
        },
      },
      fail: {
        resStr: {
          errMsg: 'request:fail 填写错误信息',
        },
      },
    },
    template: {
      succ: {
        data: {
          list: [
            {
              time: '12:00',
              percentage: '80',
            },
            {
              time: '14:00',
              percentage: '60',
            },
            {
              time: '16:00',
              percentage: '85',
            },
            {
              time: '18:00',
              percentage: '43',
            },
            {
              time: '20:00',
              percentage: '60',
            },
            {
              time: '22:00',
              percentage: '95',
            },
          ],
        },
        statusCode: 200,
        header: {
          'content-type': 'application/json; charset=utf-8',
        },
      },
      fail: {
        templateStr: {
          errMsg: 'request:fail 填写错误信息',
        },
      },
    },
  },
};

```

getInteraction.js

```js
export default {
  path: '/dataCenter/interaction',
  data: {
    returnType: 'succ',
    generateType: 'template',
    manual: {
      succ: {
        resStr: { data: '', statusCode: '', header: '' },
      },
      fail: {
        resStr: { errMsg: 'request:fail 填写错误信息' },
      },
    },
    template: {
      succ: {
        data: {
          list: [
            { name: '浏览量', number: '919' },
            { name: '点赞量', number: '887' },
            { name: '分享量', number: '104' },
            { name: '收藏', number: '47' },
          ],
        },
        statusCode: 200,
        header: { 'content-type': 'application/json; charset=utf-8' },
      },
      fail: {
        templateStr: { errMsg: 'request:fail 填写错误信息' },
      },
    },
  },
};

```

getMember.js

```js
export default {
  path: '/dataCenter/member',
  data: {
    returnType: 'succ',
    generateType: 'template',
    manual: {
      succ: {
        resStr: {
          data: '',
          statusCode: '',
          header: '',
        },
      },
      fail: {
        resStr: {
          errMsg: 'request:fail 填写错误信息',
        },
      },
    },
    template: {
      succ: {
        data: {
          list: [
            {
              name: '浏览量',
              number: '202W',
            },
            {
              name: 'PV',
              number: '233W',
            },
            {
              name: 'UV',
              number: '102W',
            },
          ],
        },
        statusCode: 200,
        header: {
          'content-type': 'application/json; charset=utf-8',
        },
      },
      fail: {
        templateStr: {
          errMsg: 'request:fail 填写错误信息',
        },
      },
    },
  },
};

```

#### 新建index.js

```js

import getDataCenterArea from './getArea'
import getDataCenterMember from './getMember'
import getDataCompleteRate from './getCompleteRate'
import getDataInteraction from './getInteraction'

export default [
  getDataCenterArea,
  getDataCenterMember,
  getDataCompleteRate,
  getDataInteraction
]
```

### 在page中的index.js中引用

微信小程序中宽度为750rpx，**rpx为百分比长度**

```js
// pages/dataCenter.js
import request from '../../api/request'

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    totalSituationDataList: null,
    totalSituationKeyList: null,
    completeRateDataList: null,
    complete_rate_keyList: null,
    interactionSituationDataList: null,
    interaction_situation_keyList: null,
    areaDataList: null,
    areaDataKeysList : null,
    memberitemWidth: null,
    smallitemWidth: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    /**
     * 整体情况
     */
    request('/dataCenter/member').then(res => {
      const totalSituationData = res.data.template.succ.data.list;
      that.setData({ 
        totalSituationDataList: totalSituationData,
        totalSituationKeysList: Object.keys(totalSituationData[0])
      });

      // 计算每个.item元素的宽度
      const itemWidth = `${(750 - 32 * (totalSituationData.length - 1)) / totalSituationData.length}rpx`;

      // 更新.item元素的样式
      that.setData({
        memberitemWidth: itemWidth
      });
    })


    /**
     * 互动情况
     */

    request('/dataCenter/interaction').then(res => {
      const interactionSituationData = res.data.template.succ.data.list;
      that.setData({ 
        interactionSituationDataList: interactionSituationData,
        interactionSituationKeysList: Object.keys( interactionSituationData[0])
      });

      // 计算每个.item元素的宽度
      const itemWidth = `${(750 - 32 * (interactionSituationData.length - 1)) / interactionSituationData.length}rpx`;
      // 更新.item元素的样式
      that.setData({
        smallitemWidth: itemWidth
      });

    })
    /**
     * 完播率
     */ 

    request('/dataCenter/complete-rate').then(res => {
      const completeRateData = res.data.template.succ.data.list;
      that.setData({ 
        completeRateDataList: completeRateData,
        completeRateKeysList: Object.keys(completeRateData[0])
      });

      // 计算每个.item元素的宽度
      const itemHeight = `${(380) / completeRateData.length}rpx`;

      // 更新.item元素的样式
      that.setData({
        itemHeight: itemHeight
      });
    })
    
    /**
     * 按区域统计
     */

    request("/dataCenter/area").then(res => {
      const areaData = res.data.template.succ.data.list;
      that.setData({
        areaDataList: areaData,
        areaDataKeysList: Object.keys(areaData[0])
      })
    }) 

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
```

### 页面实例

![image-20230915161617570](Mock%E4%BD%BF%E7%94%A8/image-20230915161617570.png)



## 数据模板定义规范 DTD

`生成规则` 有 7 种格式：

```
'name|min-max': value
'name|count': value
'name|min-max.dmin-dmax': value
'name|min-max.dcount': value
'name|count.dmin-dmax': value
'name|count.dcount': value
'name|+step': value
```

**生成规则和示例：**

### 1. 属性值是字符串 **String**

1. `'name|min-max': string`

   通过重复 `string` 生成一个字符串，重复次数大于等于 `min`，小于等于 `max`。

2. `'name|count': string`

   通过重复 `string` 生成一个字符串，重复次数等于 `count`。

### 2. 属性值是数字 **Number**

1. `'name|+1': number`

   属性值自动加 1，初始值为 `number`。

2. `'name|min-max': number`

   生成一个大于等于 `min`、小于等于 `max` 的整数，属性值 `number` 只是用来确定类型。

3. `'name|min-max.dmin-dmax': number`

   生成一个浮点数，整数部分大于等于 `min`、小于等于 `max`，小数部分保留 `dmin` 到 `dmax` 位。

```
Mock.mock({
    'number1|1-100.1-10': 1,
    'number2|123.1-10': 1,
    'number3|123.3': 1,
    'number4|123.10': 1.123
})
// =>
{
    "number1": 12.92,
    "number2": 123.51,
    "number3": 123.777,
    "number4": 123.1231091814
}
```

### 3. 属性值是布尔型 **Boolean**

1. `'name|1': boolean`

   随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2。

2. `'name|min-max': value`

   随机生成一个布尔值，值为 `value` 的概率是 `min / (min + max)`，值为 `!value` 的概率是 `max / (min + max)`。

### 4. 属性值是对象 **Object**

1. `'name|count': object`

   从属性值 `object` 中随机选取 `count` 个属性。

2. `'name|min-max': object`

   从属性值 `object` 中随机选取 `min` 到 `max` 个属性。

### 5. 属性值是数组 **Array**

1. `'name|1': array`

   从属性值 `array` 中随机选取 1 个元素，作为最终值。

2. `'name|+1': array`

   从属性值 `array` 中顺序选取 1 个元素，作为最终值。

3. `'name|min-max': array`

   通过重复属性值 `array` 生成一个新数组，重复次数大于等于 `min`，小于等于 `max`。

4. `'name|count': array`

   通过重复属性值 `array` 生成一个新数组，重复次数为 `count`。

### 6. 属性值是函数 **Function**

1. `'name': function`

   执行函数 `function`，取其返回值作为最终的属性值，函数的上下文为属性 `'name'` 所在的对象。

### 7. 属性值是正则表达式 **RegExp**

1. `'name': regexp`

   根据正则表达式 `regexp` 反向生成可以匹配它的字符串。用于生成自定义格式的字符串。

   ```
   Mock.mock({
       'regexp1': /[a-z][A-Z][0-9]/,
       'regexp2': /\w\W\s\S\d\D/,
       'regexp3': /\d{5,10}/
   })
   // =>
   {
       "regexp1": "pJ7",
       "regexp2": "F)\fp1G",
       "regexp3": "561659409"
   }
   ```



