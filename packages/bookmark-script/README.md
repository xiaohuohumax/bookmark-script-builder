# @xiaohuohumax/bookmark-script

**基于 `rollup` 的书签脚本打包工具 Bookmarklet Cli**

## 作用

```ts
alert('Hello, World!');
```
将上面代码打包成类型以下浏览器书签链接

```text
javascript:(function(){alert("Hello, World!");})();void(0);
```

## 使用

1. 创建空项目

```shell
npm init -y
```

2. 添加必要依赖

```shell
npm i @xiaohuohumax/bookmark-script
```

4. 编写配置文件

```txt
project
 ├── bm.config.ts
 ├── package.json
 ├── src
 │   ├── index.ts
 │   └── time.png
 └── tsconfig.json
```

配置文件

```js
// bm.config.ts 或 bm.config.js
import { defineConfig } from '@xiaohuohumax/bookmark-script';
import { name, author, version } from './package.json';

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

### 编写书签脚本


```ts
// index.ts
// 也可以使用第三方库 比如: axios, sweetalert2等
// import axios from 'axios';
alert(new Date());
```

### 打包构建

修改 `package.json`

使用 npx bookmark-script --help 可查看其他配置
```json
{
  "scripts": {
    "build": "bookmark-script"
  },
}
```
开始打包

```shell
npm run build
```
输出结果

```txt
dist
 ├── favorites.html     // 可以通过浏览器直接导入
 └── show time
     ├── bookmark.txt   // 书签脚本版本(手动添加至书签)
     └── console.js     // 控制台版本(F12执行即可)
```

## 扩展使用

1. 扫描脚本的注释信息来自动导入, 不再需要手动填写 `bms` 参数

```ts
import { defineConfig, scanScript } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  bms: scanScript({
    // 扫描路径
    root: 'src',
    // 注释前缀
    optionPrefix: '#',
    // 注释文件标识名称
    folderFileName: 'bmf.txt'
  }),
});
```

``` text
src
  ├── bmf.txt  // 用于配置文件夹信息
  └── index.ts

```
bmf.txt 注释格式: `[optionPrefix][option] value`

```text
#name 公共脚本
#icon ....
...
```

脚本标识 脚本开头添加对应注释即可

```ts
/**
 * #name 显示时间
 * #icon ...
 */
alert('....')
```

2. 脚本中使用注释信息

```ts
/**
 * #name 显示时间
 * #icon ...
 * #isBuild true
 */

// ts 提示未定义 则在 tsconfig.json 的 types 添加 @xiaohuohumax/bookmark-script/client 即可
import meta from 'bookmark:meta';

console.log(meta.name, meta.icon);
```

3. 利用 `rollup` 插件扩展其他类型文件

```ts
import { defineConfig, scanScript } from '@xiaohuohumax/bookmark-script';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';

export default defineConfig(() => {
  return {
    plugins: [
      // 处理 ts 脚本
      typescript({ check: false }),
      // 处理 css
      postcss(),
      // 路径别名
      alias({
        entries: {
          '@': path.resolve(__dirname, 'src'),
          '#': path.resolve(__dirname, '')
        }
      }),
      // 解析 json 格式
      json()
    ],
  };
});
```

5. 全局环境变量


```text
# .env
APP_NAME = show time
```

```ts
// 添加代码提示 env.d.ts
interface ImportMetaEnv {
  // 默认自带
  MODE: string
  // 扩展 ...
  APP_NAME: string
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
}
```

使用

```ts
alert(import.meta.env.APP_NAME)
// show time
```

6. 构建模式

```shell
# 例如 设置为 dev 模式
npx bookmark-script -m dev
```
配置文件会依据模式不同而加载不同配置 `bm.config.[mode].js/ts`

环境变量也是如此 `.env.[mode].local` `.env.[mode]`

7. 多配置文件合并

```ts
// bookmark-script -m dev
// bm.config.dev.ts
import { mergeConfig, scanScript } from '@xiaohuohumax/bookmark-script';
import baseConfig from './bm.config.ts';

export default mergeConfig(
  baseConfig,
  {
    bms: [
      // 新配置
    ]
  }
);
```

## 最后

玩的开心 🎉🎉🎉🎉