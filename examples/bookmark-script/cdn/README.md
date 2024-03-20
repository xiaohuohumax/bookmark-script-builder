# 使用CDN

脚本代码不打包到书签中, 使用时通过请求CDN地址执行

### 添加CDN地址

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  cdn: 'http://127.0.0.1:5500/dist/'
});
```

### 打包结果

```text
dist
 ├── cdn(1.0.0)
 │   ├── bookmark-network.txt   // 网络版请求CDN
 │   ├── bookmark.txt           // 离线版
 │   └── console.js             // 控制台版, 也是CDN保存和请求的代码
 ├── favorites-network.html     // 网络版HTML书签
 └── favorites.html             // 离线版HTML书签
```