//注册,主要缓存内容
const CACHE_NAME = 'cache_3'; //定义存储缓存的名字--类似数据库
const CACHE_URL = [
    '/',
    '/image/icon.png',
    '/manifest.json',
    '/index.css'
]
self.addEventListener('install', async event => {
    console.log('----install-----')
    console.log(event)
    //self.skipWaiting 会让service worker 跳过等待直接进入activate
    //event.waitUntil 等待skipWaiting 结束后才进入activate

    //开启cache缓存，类似连接数据库
    const cache = await caches.open(CACHE_NAME);

    //cache 添加需要缓存的资源,使用await 等待把所有缓存存起来再进行
    await cache.addAll(CACHE_URL)
    //跳过等待直接进入activate
    await self.skipWaiting();
});
//激活，主要清除缓存
self.addEventListener('activate', async event => {
    console.log('----activate-----')
    console.log(event)
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
    //可以抓取到所有网络请求
    console.log('----fetch-----')
    console.log(event)
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