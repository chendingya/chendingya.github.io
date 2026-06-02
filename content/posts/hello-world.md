---
title: Hello World
date: 2022-10-25 11:40:36
tags: Hexo
categories: Hexo
---
Welcome to [Hexo](https://hexo.io/)! This is your very first post. Check [documentation](https://hexo.io/docs/) for more info. If you get any problems when using Hexo, you can find the answer in [troubleshooting](https://hexo.io/docs/troubleshooting.html) or you can ask me on [GitHub](https://github.com/hexojs/hexo/issues).

## Quick Start

### Create a new post

``` bash
$ hexo new "My New Post"
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server

``` bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

``` bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/one-command-deployment.html)

### 整理source/post下的文章

新增文件夹不会影响，例如新增source/posts/23-Compiler，并将文章和图片文件夹一起移入，在文章中使用相对地址来引入图片，并安装插件[hexo](https://so.csdn.net/so/search?q=hexo&spm=1001.2101.3001.7020)-asset-image

确保 `_config.yml` 中 `post_asset_folder: true`.

使用 `![logo](ch01/logo.jpg)` 就可引用到图片 `logo.jpg`.

```
npm install hexo-asset-image@0.0.1 --save
```

