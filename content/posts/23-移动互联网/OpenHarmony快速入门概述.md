---
title: OpenHarmony快速入门概述
date: 2023-10-04 11:40:36
tags: openharmony
categories: openharmony


---



# OpenHarmony快速入门概述

OpenHarmony是一款面向全场景的开源分布式操作系统，采用组件化设计，支持在128KiB到xGiB RAM资源的设备上运行系统组件，设备开发者可基于目标硬件能力自由选择系统组件进行集成。

OpenHarmony当前定义了三种基础系统类型，设备开发者通过选择基础系统类型完成必选组件集配置后，便可实现其最小系统的开发。这三种基础系统类型的参考定义如下：

**表1** 基础类型系统简介

| 类型                        | 处理器                                             | 最小内存 | 能力                                                         |
| --------------------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------ |
| 轻量系统（mini system）     | MCU类处理器（例如Arm Cortex-M、RISC-V 32位的设备） | 128KiB   | 提供多种轻量级网络协议，轻量级的图形框架，以及丰富的IOT总线读写部件等。可支撑的产品如智能家居领域的连接类模组、传感器设备、穿戴类设备等。 |
| 小型系统（small system）    | 应用处理器（例如Arm Cortex-A的设备）               | 1MiB     | 提供更高的安全能力、标准的图形框架、视频编解码的多媒体能力。可支撑的产品如智能家居领域的IP Camera、电子猫眼、路由器以及智慧出行域的行车记录仪等。 |
| 标准系统（standard system） | 应用处理器（例如Arm Cortex-A的设备）               | 128MiB   | 提供增强的交互能力、3D GPU以及硬件合成能力、更多控件以及动效更丰富的图形能力、完整的应用框架。可支撑的产品如高端的冰箱显示屏。 |

本文通过介绍OpenHarmony系统的开发环境搭建、编译、烧录、调测以及运行“Hello World”等，引导开发者快速熟悉OpenHarmony设备开发的基本流程和方法。

## 操作方式

考虑到开发者的开发习惯，OpenHarmony为开发者提供了以下两种入门指导：

**表2** 入门方式

| 方式                                                         | 工具                      | 特点                                                         | 适用人群                                            |
| ------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| [基于IDE入门](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-ide-env-win.md) | IDE（DevEco Device Tool） | 完全采用IDE进行一站式开发，编译依赖工具的安装及编译、烧录、运行都通过IDE进行操作。 DevEco Device Tool采用Windows+Ubuntu混合开发环境： - 在Windows上主要进行代码开发、代码调试、烧录等操作。 - 在Ubuntu环境实现源码编译。 DevEco Device Tool提供界面化的操作接口，可以为您提供更快捷的开发体验。 | - 不熟悉命令行操作的开发者 - 习惯界面化操作的开发者 |
| [基于命令行入门](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-pkg-prepare.md) | 命令行工具包              | 通过命令行方式下载安装编译依赖工具，在Linux系统中进行编译时，相关操作通过命令实现；在Windows系统中使用开发板厂商提供的工具进行代码烧录。 命令行方式提供了简便统一的工具链安装方式。 | 习惯使用命令行操作的开发者                          |

# 基于IDE

## 搭建Windows环境

在嵌入式开发中，很多开发者习惯于使用Windows进行代码的编辑，比如使用Windows的Visual Studio Code进行OpenHarmony代码的开发。但当前阶段，大部分的开发板源码还不支持在Windows环境下进行编译，如Hi3861、Hi3516系列开发板。因此，建议使用Ubuntu的编译环境对源码进行编译。

在以上的设备开发场景中，可以搭建一套Windows+Ubuntu混合开发的环境，其中使用Windows平台的DevEco Device Tool可视化界面进行相关操作，通过远程连接的方式对接Ubuntu下的DevEco Device Tool（可以不安装Visual Studio Code），然后对Ubuntu下的源码进行开发、编译、烧录等操作。

本章节介绍开发所需Windows环境的搭建方法。

## 系统要求

- Windows 10 64位系统，推荐内存8GB及以上，硬盘100GB及以上。

- 建议Windows和Ubuntu系统上安装的DevEco Device Tool为最新版本，且版本号需相同。

  > ![icon-note.gif](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/public_sys-resources/icon-note.gif) **说明：** 下面以3.1 Release版本的IDE进行说明，不同版本的IDE在支持的特性和操作上略有差别，具体情况可参考[该工具的使用指南](https://gitee.com/link?target=https%3A%2F%2Fdevice.harmonyos.com%2Fcn%2Fdocs%2Fdocumentation%2Fguide%2Fservice_introduction-0000001050166905)。

## 操作步骤

1. 下载[DevEco Device Tool](https://gitee.com/link?target=https%3A%2F%2Fdevice.harmonyos.com%2Fcn%2Fide%23download)最新Windows版本软件包。

2. 解压DevEco Device Tool压缩包，双击安装包程序，单击**下一步**进行安装。

3. 请详细阅读以下界面的用户协议和隐私声明，需勾选“我接受许可证协议中的条款”后，才能继续下一步的安装。

4. 设置DevEco Device Tool的安装路径，请注意安装路径不能包含中文字符，**不建议安装到C盘目录**，单击**下一步**。

   ![zh-cn_image_0000001326386753](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/zh-cn_image_0000001326386753.png)

5. 根据安装向导提示，安装依赖的工具。

   ![zh-cn_image_0000001285965546](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/zh-cn_image_0000001285965546.png)

   其中，

   - 安装：按照默认路径及参数直接安装。
   - 自定义安装：安装前可以自行修改安装路径及其他设置参数。

   安装完成后，各软件状态显示为OK。

   ![zh-cn_image_0000001285965778](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/zh-cn_image_0000001285965778.png)

6. 依赖的工具安装完成后，单击**安装**，开始安装DevEco Device Tool。

7. 继续等待DevEco Device Tool安装向导自动安装DevEco Device Tool插件，直至安装完成，单击**完成**，关闭DevEco Device Tool安装向导。

   ![zh-cn_image_0000001275267040](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/zh-cn_image_0000001275267040.png)

8. 打开Visual Studio Code，进入DevEco Device Tool工具界面。至此，DevEco Device Tool Windows开发环境安装完成。

   ![zh-cn_image_0000001338012765](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/zh-cn_image_0000001338012765.png)



# 基于命令行

## 准备开发环境

在嵌入式开发中，很多开发者习惯于使用Windows进行代码的编辑，比如使用Windows的Visual Studio Code进行OpenHarmony代码的开发。但当前阶段，大部分的开发板源码还不支持在Windows环境下进行编译，如Hi3861、Hi3516系列开发板。因此，建议使用Ubuntu的编译环境对源码进行编译。同时，开发板的烧录需要在Windows环境中进行。

在基于命令行方式开发的过程中，除下述[Windows环境要求](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-pkg-prepare.md#windows环境要求)、[Ubuntu环境要求](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-pkg-prepare.md#ubuntu环境要求)外，不对开发设备做另外的要求，请用户自行准备Windows环境、Ubuntu环境。本章节主要介绍通过Samba服务器实现Windows环境远程连接Ubuntu环境的方法。

> ![icon-note.gif](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/public_sys-resources/icon-note.gif) **说明：** OpenHarmony还为开发者提供了[Docker环境](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/get-code/gettools-acquire.md)，整合的docker包在很大程度上简化了编译前的环境配置，习惯使用命令行的开发者也可以选择Docker环境进行编译 。

进行工具安装之前，需要做如下准备。

## Windows环境要求

源码烧录需要Windows10 64位的系统环境。

## Ubuntu环境要求

- Ubuntu18.04及以上版本，X86_64架构，内存推荐16 GB及以上。
- Ubuntu系统的用户名不能包含中文字符。

## 远程访问准备

当在Windows下进行烧录时，开发者需要访问Ubuntu环境下的源码和镜像文件。您可以使用习惯的文件传输或共享工具实现文件的共享或传输。

此处介绍通过Samba服务器进行连接的操作方法。

### 配置Samba服务器

在Ubuntu环境下进行以下操作：

1. 安装Samba软件包。

   ```
   sudo apt-get install samba samba-common
   ```

2. 修改Samba配置文件，配置共享信息。 打开配置文件：

   ```
   sudo gedit /etc/samba/smb.conf   
   ```

   在配置文件末尾添加以下配置信息（根据实际需要配置相关内容）：

   ```
   [Share]                    #在Windows中映射的根文件夹名称（此处以“Share”为例）
   comment = Shared Folder    #共享信息说明
   path = /home/share         #共享目录
   valid users = username     #可以访问该共享目录的用户（Ubuntu的用户名）
   directory mask = 0775      #默认创建的目录权限
   create mask = 0775         #默认创建的文件权限
   public = yes               #是否公开
   writable = yes             #是否可写
   available = yes            #是否可获取
   browseable = yes           #是否可浏览
   ```

3. 添加Samba服务器用户和访问密码。

   ```
   sudo smbpasswd -a username   #用户名为Ubuntu用户名。输入命令后，根据提示设置密码。
   ```

4. 重启Samba服务。

   ```
   sudo service smbd restart
   ```

### 设置Windows映射

在Windows环境下进行以下操作：

1. 右键计算机选择映射网络驱动器，输入共享文件夹信息。在文件夹输入框填入Ubuntu设备的IP地址和Ubuntu共享文件夹的路径。

   ![quickstart-pkg-prepare-networkdriver](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/quickstart-pkg-prepare-networkdriver.png)

2. 输入Samba服务器的访问用户名和密码（[在配置Samba服务器时已完成配置](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-pkg-prepare.md#配置samba服务器)）。

   ![quickstart-pkg-prepare-setsamba](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/quickstart-pkg-prepare-setsamba.png)

3. 用户名和密码输入完成后即可在Windows下看到Linux的共享目录，并可对其进行访问。





# 开发板

本文选取了如下三款典型开发板，用于介绍不同系统的开发过程，开发者可根据需要自行购买开发板。

**表3** 开发板-系统对应关系

| 名称            | 适配系统 | 简介                                                         |
| --------------- | -------- | ------------------------------------------------------------ |
| Hi3861 WLAN模组 | 轻量     | [Hi3861开发板介绍](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-appendix-hi3861.md) |
| Hi3516DV300     | 小型     | [Hi3516开发板介绍](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-appendix-hi3516.md) |
| RK3568          | 标准     | [RK3568开发板介绍](https://gitee.com/openharmony/docs/blob/master/zh-cn/device-dev/quick-start/quickstart-appendix-rk3568.md) |

# 开发流程

设备开发快速入门流程如下图所示。

**图1** 快速入门开发流程

![quickstart-overview-process](https://gitee.com/openharmony/docs/raw/master/zh-cn/device-dev/quick-start/figures/quickstart-overview-process.png)