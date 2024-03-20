# 代码中获取书签信息

代码中获取书签信息(代码顶部注释中的书签信息 或者 `bm.config.js` 中的 `bms` 书签信息)

### 使用

```ts
/**
 * #name meta
 * #version 1.0.0
 * #build true
 */

// 导入虚拟模块 bookmark:meta
import meta from 'bookmark:meta';

console.log(meta);
// { name: 'mete', version: '1.0.0', build: true }
```

### 虚拟模块智能提示

`tsconfig.json` 中添加

```json
{
  "compilerOptions": {
    "types": [
      "@xiaohuohumax/bookmark-script/client"
    ],
  },
}
```