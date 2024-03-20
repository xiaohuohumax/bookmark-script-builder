# @xiaohuohumax/bookmark-script

**基于 `vite` `Rollup` 的书签脚本打包工具 Bookmarklet Cli**

## 作用

```ts
alert('Hello, World!');
```
将上面代码打包成类型以下浏览器书签链接

```text
javascript:(function(){alert("Hello, World!");})();void(0);
```

## 使用

### 添加依赖

```shell
npm i @xiaohuohumax/bookmark-script
```

### 编写配置文件

```txt
project
 ├── bm.config.ts
 ├── package.json
 ├── src
 │   ├── index.ts
 │   └── time.png
 └── tsconfig.json
```

```js
// bm.config.ts 或 bm.config.js
import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  // 输出目录
  outDir: 'dist',
  // 书签打包结构, 以及书签脚本入口文件, 图标等
  bms: [
    {
      name: 'show time',
      description: ''
      href: 'src/time.ts',
      icon: 'src/time.png'
    }
  ],
  // 其他必要配置
  ...
});
```

### 添加智能提示 (可选)

tsconfig.json

```json
{
  "compilerOptions": {
    "types": [
      "@xiaohuohumax/bookmark-script/client"
    ],
  },
}
```

### 编写书签脚本

```ts
// index.ts
// 也可以使用第三方库 比如: axios, sweetalert2等
// import axios from 'axios';
alert(new Date());
```

### 打包构建

修改 `package.json`

使用 npx bookmark-script --help 可查看其他参数

```json
{
  "scripts": {
    "build": "bookmark-script"
  },
}
```

**输出结果**

```txt
dist
 ├── favorites.html     // 可以通过浏览器直接导入
 └── show time
     ├── bookmark.txt   // 书签脚本版本(手动添加至书签)
     └── console.js     // 控制台版本(F12执行即可)
```

## 简单示例

+ [路径别名](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/alias#readme)
+ [使用CDN减少书签大小](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/cdn#readme)
+ [自定义打包构建](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/custom#readme)
+ [配置环境变量](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/env#readme)
+ [书签添加图标](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/icon#readme)
+ [脚本banner](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/banner#readme)
+ [脚本中获取书签信息](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/meta#readme)
+ [扫描脚本并构建](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/scan#readme)
+ [代码混淆压缩](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/minify#readme)
+ [将Vue组件构建成书签脚本](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/vue#readme)
+ [将React组件构建成书签脚本](https://github.com/xiaohuohumax/bookmark-script-builder/tree/main/examples/bookmark-script/react#readme)

## 最后

玩的开心 🎉🎉🎉🎉