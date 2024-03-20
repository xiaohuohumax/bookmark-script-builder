# 使用环境变量

代码中使用环境变量, 使用与 `vite` 相同

### 添加配置

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  // 环境变量文件夹
  envDir: 'env',
  // 环境变量前缀 默认 BM_
  envPrefix: 'BM_',
});
```

### 添加环境变量dts提示

创建下面文件, 并添加到 tsconfig.json 中

```ts
// env.d.ts
interface ImportMetaEnv {
  // 自行扩展
  BM_APP_NAME: string
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
}
```

```json
{
  "include": [
    "src",
    // 添加提示
    "*.d.ts"
  ]
}
```

### 创建环境变量


```text
// .env
BM_APP_NAME = env
```

### 使用

```ts
console.log(import.meta.env.BM_APP_NAME);
```