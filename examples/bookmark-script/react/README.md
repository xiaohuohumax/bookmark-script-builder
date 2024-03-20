# React组件打包成书签脚本

简单打包 React 组件

### 使用

#### 修改 `main.tsx` 入口文件

1. 添加书签信息
2. 根节点手动创建, 并注入 `body` 中

```ts
/**
 * #name react component
 * #version 1.0.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.createElement('div');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
document.body.appendChild(root);

```