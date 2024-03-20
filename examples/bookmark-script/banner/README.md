# 脚本banner

添加于打包结果最前面的注释

### 特殊可替换信息

格式: `[key]`

### 目前支持替换字段

1. 书签信息全部: `[name]` `[description]` `[version]` `...`
2. 扩展
   1. `[time]` 打包时间
   2. `[mode]` 打包模式

### 修改配置

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';
import { author, version, name, license } from './package.json';

export default defineConfig({
  banner: `/**
 * [name] [version]
 * [description]
 * 
 * href: [href]
 * icon: [icon]
 * 
 * Create time: [time]
 * Build mode: [mode]
 * 
 * Power by ${name} ${version}
 * Copyright (c) 2020-present ${author}
 * @license ${license}
 */`,
  scans: [{
    root: 'src'
  }]
});
```

### 结果

```ts
/**
 * base 1.0.0
 * description info
 * 
 * href: ...\examples\bookmark-script\banner\src\index.ts
 * icon: ./xxx.png
 * 
 * Create time: 2024/3/20 14:24:25
 * Build mode: dev
 * 
 * Power by @xiaohuohumax/example-base 1.0.1
 * Copyright (c) 2020-present xiaohuohumax
 * @license MIT
 */
// code
```
