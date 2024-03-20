# 代码混淆压缩

代码压缩设置

### 全局配置

**注意:** 此配置只针对 `控制台版本` 默认 `开启压缩`

使用 CDN 时, 推荐 `开启压缩`

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  scans: [{
    root: 'src'
  }],
  // 全局压缩
  minify: true
});
```

### 脚本单独配置

**PS:** 优先级高于全局

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  bms: [
    {
      name: 'm',
      href: './src/index.ts',
      // 单独配置
      minify: false
    }
  ],
});
```

**或者**

```ts
/**
 * #name base
 * #version 1.0.0
 * #build true
 * #minify false
 */
```