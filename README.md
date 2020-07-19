
![](https://s1.ax1x.com/2020/07/17/UsQz7j.png)

PWA（Progressive web apps，渐进式 Web 应用）运用现代的 Web API 以及传统的渐进式增强策略来创建跨平台 Web 应用程序， 是Google 在2016年提出的概念，2017年落地的web技术。目的就是在移动端利用提供的标准化框架，在网页应用中实现和原生应用相近的用户体验的渐进式网页应用。

<!-- more -->

### pwa的优势

1. **渐进式**  - 适用于所有浏览器，因为它是以渐进式增强作为宗旨开发的。
2. **流畅** - 能够借助 service worker 在离线或者网络不好的条件下访问。
3. **可安装** - 用户可以添加常用的webapp到桌面上，免去去应用商店下载的麻烦。
4. **原生体验** - 可以和app一样拥有首屏加载动画，可以隐藏地址栏等沉浸式体验。
5. **粘性** - 通过离线通知，可以让用户回流。



### manifest 应用程序清单的配置

manifest是一个可配置的json文件，可以使web添加至桌面，设置启动图标，隐藏地址栏等操作



- 在html文件中引用配置文件

  ```html
  <link rel="manifest" href="manifest.json">
  ```

- 编写 manifest.json 文件

  ```json
  {
      "name":"pwa渐进式web",
    "short_name":"pwa",
      "icons":[{
          "src": "./image/icon.png",
          "sizes": "144x144",
          "type": "image/png"
      }],
      "background_color":"#9b59b6",
      "theme_color":"#34495e",
      "display":"standalone",
      "start_url":"/index.html"
  }
  ```
  
  
  
  manifest 属性

| 属性明           | 描述                                                         |
| ---------------- | ------------------------------------------------------------ |
| name             | 用于指定应用的名称和启动画面的文字                           |
| short_name       | 应用的短名称，用于主屏显示                                   |
| start_url        | 指定应用启动加载的页面                                       |
| icons            | 指定各种环境中作为应用的图标，最佳144x144                    |
| background_color | 启动动画的背景颜色                                           |
| theme_color      | 应用程序的主题颜色                                           |
| display          | fullscreen：全屏显示，不显示状态栏；standalone：更像一个独立的应用程序；minimal-ui：拥有地址显示栏； |



浏览器中就已经可以看到配置信息了

![image-20200717174214643](https://cdn.jsdelivr.net/gh/superliebe/picGo/20200717174214.png)



### service worker

- 一个标准的pwa程序必须包含3个部分
  1. https 服务器 或者 http://localhost
  2. manifest.josn文件
  3. service worker
- service worker 主要用来做持久的离线化缓存;
- service worker 可以极大提升webapp的用户体验;
- service worker 是一个独立的worker线程，独立于网页进程;
- 必须在https下才能正常工作;
- 一旦被install后必须手动unregister;



![image-20200717175058142](https://cdn.jsdelivr.net/gh/superliebe/picGo/20200717175058.png)

#### 生命周期

- **install** 注册成功时触发，主要用于缓存资源；
- **acvitate** 激活时触发，主要用于删除旧资源；

- **fetch** 发送请求时触发，主要用于操作缓存和读取网络资源；

#### 使用方法

- 在window.onload中注册service worker ,防止与其他资源竞争；
- 老的浏览器版本不兼容，需要使用 `if('serviceWorker' in navigator){}；` ;
- 注册service worker  , navigator.serviceWork.register('./sw.js')，返回一个promise对象；
-  ` self.skipWaiting()`跳过等待，返回一个promise对象；
- `event.waitUntil()` 方法的扩展参数是一个promise对象，会在promise结束后结束当前生命周期函数，防止浏览器在异步操作；
- service worker 激活后，会在下一次刷新页面的时候生效，可以通过`self.clients.claim()`立即获取控制权；

```html
   // 页面加载完之后，注册serviceWorker
        window.addEventListener('load',async ()=>{
            // 检测是否可用
            if('serviceWorker' in navigator){
                try{
                    const registration = await navigator.serviceWorker.register('./sw.js');
                    console.log("注册成功",registration)
                }catch(e){
                    console.log("注册失败",e)
                }
            }
        });
```

sw.js  这三个写法基本固定

```js
//注册
self.addEventListener('install', event => {
    console.log('----install-----')
    console.log(event)
    //self.skipWaiting 会让service worker 跳过等待直接进入activate
    //event.waitUntil 等待skipWaiting 结束后才进入activate
    event.waitUntil(self.skipWaiting()) 
});
//激活
self.addEventListener('activate', event => {
    console.log('----activate-----')
    console.log(event)
    //service worker 激活后，立即获取控制权
    event.waitUntil(self.clients.claim());
});
//拦截请求
self.addEventListener('fetch',event => {
    //可以抓取到所有网络请求
    console.log('----fetch-----')
    console.log( event)
});
```



刷新浏览器就可以看到控制台上相应生命周期输出的结果

![image-20200718174427487](https://cdn.jsdelivr.net/gh/superliebe/picGo/20200718174427.png)

![image-20200718174524089](https://cdn.jsdelivr.net/gh/superliebe/picGo/20200718174524.png)

#### fetch api 

类似于ajax，专门用于service worker 中请求数据使用 fetch(url,config)

```js
fetch("/api/...").then(res=>{
    //res得到的事响应式内容，是一个二进制流
    //调用res.json 可以把数据转化为可读的json格式
    return res.json()
}).then(data=>{
    console.log(data)
})
```



#### notification 通知

通过推送告诉用户某信息，比如断网/联网的时候要通知到用户，提升用户体验。

**Notification.permission** 可以获取到当前用户通知 的权限

- defalut 默认，未授权
- denied 拒绝授权，无法再次请求授权，无法弹出窗口
- granted 通过授权

**Notification.requestPremission()** 可以请求用户授权。

**new Notification('提示的标题',{body:'提示的内容',icon:'提示的图标'}) ** 可以显示通知。

 ![image-20200718194420948](https://cdn.jsdelivr.net/gh/superliebe/picGo/20200718194421.png)



```js
        //如果一进来我们发现用户没有联网就给用户一个通知
        if(Notification.permission=='defalut'){
            //授权开启通知
            Notification.requestPermission();
        }
        if(!navigator.onLine){
            //断网
            console.log("断网")
            new Notification("提示",{body:'网络已断开,您访问的是缓存',icon:'/image/icon.png'})
        }

        window.addEventListener("online",()=>{
            console.log("网络已连接")
            new Notification("提示",{body:'网络已连接，请刷新页面获取新的数据',icon:'/image/icon.png'})
        })
```





#### cache storage

配合service worker  来实现缓存



**caches.api 常用方法**

1. `caches.open(cachesName).then(res=>{})` 用户打开一个缓存，返回一个匹配cachesNam的catch对象promise，类似于链接数据库操作；
2. `caches.keys()` 返回一个promise对象，包括所有缓存的key (数据库名) ；
3. `caches.delete(key)` 根据key删除对应的缓存；



**cache 常用方法（单条数据操作）**

1. `cache.put(req,res)` 把请求当key，并把对应的相应存储起来；
2. `cache.add(url)` 根据url发起请求，并把相应结果存储起来；
3. `cache.addAll(url)` 抓取一个url数组，并把结果都存起来；
4. `cache.match(req)` 获取req对应的response；



**通过caches api 来实现读取离线缓存**

![U29h1H.png](https://s1.ax1x.com/2020/07/18/U29h1H.png)

html中引入对应的资源文件，在页面加载完之后，注册serviceWorker。

sw.js

```js
//注册,主要缓存内容
const CACHE_NAME = 'cache_3'; //定义存储缓存的名字--类似数据库
const CACHE_URL = [
    '/',
    '/image/icon.png',
    '/manifest.json',
    '/index.css'
]
self.addEventListener('install', async event => {
    //开启cache缓存，类似连接数据库
    const cache = await caches.open(CACHE_NAME);
    //cache 添加需要缓存的资源,使用await 等待把所有缓存存起来再进行
    await cache.addAll(CACHE_URL)
    //跳过等待直接进入activate
    await self.skipWaiting();
});
//激活，主要清除缓存
self.addEventListener('activate', async event => {
    //获取到左右资源的key
    const keys = await caches.keys()
    keys.forEach(key => {
        if (key != CACHE_NAME) {
            //旧资源
            caches.delete(key)
        }
    })
    //service worker 激活后，立即获取控制权
    await self.clients.claim();
});
//监听请求，判断资源是否能够请求成功，成功则取相应结果，断网则取缓存内容
self.addEventListener('fetch', async event => {
    //请求对象
    const req = event.request;
    //只缓存同源内容
    const url = new URL(req.url);
    if (url.origin !== location.origin) {
        return
    }
    //给浏览器相应,
    if (req.url.includes("/api")) {
        //资源走网络优先
        event.respondWith(networkFirst(req))
    } else {
        //资源走缓存优先
        event.respondWith(cacheFrist(req))
    }
});

//网络优先
async function networkFirst(req) {
    //取缓存中读取
    const cache = await caches.open(CACHE_NAME);
    //先从网络获取资源
    try {
        const fresh = await fetch(req);
        //获取到的数据应该再次更新到缓存当中，把响应的备份存到缓存当中
        cache.put(req,fresh.clone())
        return fresh
    } catch (e) {
        //匹配与req对应的资源
        const cached = await cache.match(req);
        return cached
    }
}

//缓存优先
async function cacheFrist(req) {
    //打开缓存
    const cache = await caches.open(CACHE_NAME);
    //取出对应数据
    const cached = await cache.match(req)
    if (cached) {
        //如果从缓存中得到了，直接返回缓存
        return cached
    } else {
        const fresh = await fetch(req);
        return fresh
    }
}
```

打开控制台，application中即可看到被缓存的文件。

![U2C9H0.png](https://s1.ax1x.com/2020/07/18/U2C9H0.png)



勾选network中的 offline online来关闭网络， 刷新页面会发现，即使断网的情况洗也可以访问到正常的数据。





