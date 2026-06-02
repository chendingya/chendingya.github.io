---
title: 服务端-ch17-k8s使用
date: 2024-1-4 18:32:34
categories: 服务端开发
tags: springboot

---

# k8s环境

## 安装

[GitHub - AliyunContainerService/k8s-for-docker-desktop: 为Docker Desktop for Mac/Windows开启Kubernetes和Istio。 ](https://github.com/AliyunContainerService/k8s-for-docker-desktop)

根据说明安装

## 部署dashboard

```
kubectl apply -f kubernetes-dashboard.yaml
```

kubectl： 客户端程序与远程k8s server交互
kubectl proxy： 把远程k8s server端口代理到本地端口

## 部署ingress controller

```
kubectl apply -f ingress-nginx-controller.yaml
```

## 1.4. 验证 Kubernetes 集群状态

- kubectl cluster-info
- kubectl get nodes
- kubectl get nodes –show-labels
- 给节点打标签：kubectl label node docker-desktop disktype=ssd
  - 查询满足标签的节点：kubectl get nodes -l disktype=ssd
  - 删除标签：kubectl label node docker-desktop disktype

#  k8s基本架构

![image.png](https://chillcharlie-img.oss-cn-hangzhou.aliyuncs.com/image%2F2023%2F12%2F28%2F18-55-11-2838e48395432e6ee0c51d6f1cbf08d5-20231228185510-36573e.png)

Node: 安装docker的宿主机，提供容器。
Master：管理集群的机器，安装k8s的核心模块。也可以与Node部署在同一台宿主机上。

kubelet：和Master、本地docker交互。
flannel：容器网络的第三方实现，给容器提供虚拟网络。
etcd：类似reddis的缓存系统。

k8s目的：通过多个Node节点，获得更多容器。

# 3. k8s资源👍

## 3.1. 类型

- namespaces
  - 类似java中的package
  - 可以把不同资源放在不同namespace里，不同namespace里面可以有同名资源
- ReplicaSet
  - 维持Pod实例数
- Pods
  - 以包含一个或多个容器，内部容器的逻辑宿主机
  - k8s里管理的最小资源
- Deployment
  - 负责Pod的自动创建
- Service
  - 类似微服务的“服务”概念，为外界提供一定的业务能力
  - 部署在Pod中，一个服务可以有多个Pod
- Ingress
  - 网关，把不同域名/url路由到对应的服务
  - k8s对外统一提供Ingress的入口
- configmap
  - 集群中提供配置信息的地方
  - key-value结构
- secrets
  - 涉及安全的隐私数据，有不同类别
- serviceaccounts
  - 给容器里的软件用的账户，容器和k8s server交互时用到
- DaemonSet
  - 常驻在Node上
  - 例：fluentd，常驻的Node上收集日志

## 3.2. Pod

- Pod是Kubernetes调度的最小单元 👍
- 多个容器在一个Pod中共享网络和文件系统
  - PID命名空间：Pod中不同的应用程序可以看到其他应用程序的进程ID
  - network命名空间：Pod中多个容器处于**同一个网络命名空间**，因此能够访问的IP和端口范围都是相同的。也可以通过localhost相互访问
  - IPC命名空间：Pod中的**多个容器**共享Inner-process Communication命名空间，因此可以通过SystemVIPC或POSIX进行**进程间通信**
  - UTS命名空间：Pod中的多个容器共享同一个主机名
  - Volumes：Pod中各个容器可以共享在Pod中定义分存储卷（Volume）
- restartPolicy字段
  - Always：只要退出就重启
  - OnFailure：失败退出时（exit code不为0）才重启
    - 也可能是正常的退出
  - Never：永远不重启

### 3.2.1. pod管理命令

- 创建pod

  - `kubectl run`
  - `kubectl run myspittr --image spittr:1.0-SNAPSHOT`
  - 类似docker run

- 查看pod

  - `kubectl get pods`
  - `kubectl logs -f myspittr`

- 在pod中

  执行命令

  - `kubectl exec`
  - `kubectl exec myspittr -- ls /run/secrets/kubernetes.io/serviceaccount`，在myspittr中执行`--`后的命令

- 删除pod

  - `kubectl delete pod `

### 3.2.2. 如何将pod或service的端口快速映射到本机端口（调试用）

- **port-forward**: ``kubectl port-forwardhost_ip:container_ip`
  - 和`docker -p`一样，左边宿主机右边容器端口
  - 可以直接映射pod，但更**推荐映射service**
- 映射pod：`kubectl port-forward pod/myspittr 8081:8080`
  - 访问：[http://localhost:8081/spittr/ ](http://localhost:8081/spittr/)
- 映射service：`kubectl port-forward service/demo 8081:80`

### 3.2.3. Pod、Container与Node之间的关系

![image.png](https://chillcharlie-img.oss-cn-hangzhou.aliyuncs.com/image%2F2023%2F12%2F28%2F19-32-11-f9c84bf9f2d585a4e92d0a7a6a7fe85d-20231228193210-1d543b.png)

## 3.3. Service 👍

不希望让别人直接访问pod，k8s可能会对pod做更改，ip会改变。但**cluster-ip或服务名不会改变**。

### 3.3.1. 命令

- 创建：kubectl expose
  - `kubectl expose pod  --port `
- 查看
  - kubectl svc

### 3.3.2. 如何访问Service

1. expose
2. port-forward
3. curl容器

## 3.4. Ingress 👍

- 只能路由到service，不能路由到pod
  - service有cluseter-ip，不会改变，而pod的ip可能会改变

### 3.4.1. 命令

- 创建：kubectl create ingress myspittr –class=nginx –rule=

  www.license.com/*=myspittr:8080 

  - 访问：[http://www.license.com/spittr/ ](http://www.license.com/spittr/)

- 删除：kubectl delete ingress myspittr

ingress网关默认端口80

## 3.5. 命令行快捷创建deployment、service、ingress

- kubectl create deployment myspittr–image=spittr:1.0-SNAPSHOT –port=8080
- kubectl expose deployment myspittr 把上面的这个pod的8080端口暴露为myspittr服务
- kubectl create ingress myspittr–class=nginx–rule=[www.license.com/*=myspittr:8080 ](http://www.license.com/*=myspittr:8080)
- 访问：[http://www.license.com/spittr/ ](http://www.license.com/spittr/)
- 删除：
  - kubectl delete ingress myspittr
  - kubectl delete service myspittr
  - kubectl delete deployment myspittr

## 3.6. Deployment

[Kubernetes对象之Deployment - 简书 ](https://www.jianshu.com/p/029661f38674)

- 重启：kubectl rollout restart deployment/spittr

  - kubectl rollout restart deployment –selector=app=spittr

- **更新镜像重部署**：kubectl set image deployment/spittr spittr=spittr:1.0

- 扩容：kubectl scale deployment spittr –replicas 2

- 自动伸缩

  ：kubectl autoscale deployment spittr –min=10 –max=15 –cpu-percent=80 👍

  - k8s可以依据CPU使用率动态决定实例数量的选择
  - 记得删除： kubectl delete horizontalpodautoscalers.autoscaling spittr

- 查看历史版本：kubectl rollout history deployment/spittr

- 回滚到前一个版本：kubectl rollout undo deployment/spittr

# 4. k8s常用命令

- kubectl get secrets/pods/all [ -n namespace]
- kubectl get secret mysecret-o yaml
- kubectl delete pod pod_name [ -n namespace]
- kubectl apply -f [json文件或yaml文件-路径]
- kubectl delete -f [json文件或yaml文件-路径]
- kubectl describe secret mysecret
- kubectl logs secret1-pod