# Vue组件打包成书签脚本

简单打包 Vue 组件

### 使用

#### 修改 `main.ts` 入口文件

1. 添加书签信息
2. 根节点手动创建, 并注入 `body` 中

```ts
/**
 * #name vue component
 * #version 1.0.0
 */

import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

const root = document.createElement('div');
createApp(App).mount(root);
document.body.appendChild(root);
```