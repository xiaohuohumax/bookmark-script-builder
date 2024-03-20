# 路径别名

路径使用别名

### 项目层级

```text
alias
 ├── bm.config.ts
 ├── package.json
 ├── README.md
 ├── src
 │   └── index.ts
 ├── tsconfig.json
 └── util
     └── time.ts
```


### 添加配置

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';
import path from 'node:path';

export default defineConfig({
  alias: {
    '#': path.resolve(import.meta.dirname, 'util')
  }
});
```
### 使用

```ts
// index.ts
import time from '#/time.ts'
```