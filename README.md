这是一个破解 webcontainer ，从而实现 self-host（自托管）的方案。

### 快速开始

1. pnpm install
1. pnpm dev
   1. 这时候 http://localhost:5173/ 走的默认是 webcontainer 原生的方案
   1. 在这个页面中等待初始化完，底部就会三个按钮亮起
   1. 然后点击 `start bundle server`
   1. 如果你看到右上面板输出了`Welcome to a WebContainers app! 🥳`，那么就完成了
   1. 这里走完，说明你的网络可以正常使用 webcontainer-sdk
   1. 接下来开始使用代理方案来对 webcontainer-sdk 进行代理，并将代理下来的数据缓存在本地，从而实现离线自托管
1. cd server
1. pnpm build
1. pnpm start
1. 更改访问的 url 为 http://localhost:5173/?hook
1. 接下来需要注意几点：
   1. 如果你有开网络代理，务必将 `*.local` 排除在代理在外，在 windows 系统上，到代理设置中，添加这条规则：`;*.local`
   1. 将以下几条规则添加到 hosts 文件中，建议使用 PowerToys 提供的 “Hosts 文件编辑器”：
      ```host
       127.0.0.1    stackblitz.gaubee.local
       127.0.0.1    w-corp-staticblitz.gaubee.local
       127.0.0.1    c-staticblitz.gaubee.local
       127.0.0.1    t-staticblitz.gaubee.local
       127.0.0.1    nr-staticblitz.gaubee.local
       127.0.0.1    local-corp-webcontainer-api.gaubee.local
      ```
   1. 以上这些域名是不够的，接下来需要按照浏览器访问的域名，逐步添加域名，比如类似`7i2ng3bhau7n48bm6vsxelrk3jozau-eytk--3111--24eaa195.local-corp-webcontainer-api.gaubee.local` 这样的域名，这些是没有规律的，在浏览器的 Devtools 的网络面板中，右键 table-header 打开 “Domain” 选项，如果看到 `*.gaubee.local` 域名，就进行添加，添加完后再刷新浏览器重试。
1. 直到点击`start bundle server`也输出了`Welcome to a WebContainers app! 🥳`。说明整个应用现在已经完全缓存在你本地了，缓存目录是 `server/fetch`

### 原理

本质就是通过代理来请求数据，然后做一个域名替换的过程，只不过这个过程中，需要代理服务器做各种针对性策略。

> 注意：本案例没有破解 `install deps`（也没有破解它的意义），这一步骤中相关域名的代理有一些策略，我没有去研究，只专注于直接运行 node 应用程序。

### 实验报告总结

1. 基于 webcontainer 实现 nodejs 的方案所需要耗费的内存真的不少，如果真的要使用这个方案，那么就得用单个 sdk 实例，去运行多个 nodejs 实例，否则得不偿失。
   1. 启动前内存暂用：
      > [](./assets/screenshot-20241008-145453.webp)
   1. 启动后内存暂用：
      > [](./assets/screenshot-20241008-145545.webp)
   1. 但是我发现启动多个 node 实例，会导致前一个 node 实例关停
1. 总得来说，整个项目的最终性价比并不高。除非你的 web 应用能接收高内存并且非要在前端运行 nodejs，并且 nodejs 的支持程度还得基于 webcontainer 能支持的程度。
