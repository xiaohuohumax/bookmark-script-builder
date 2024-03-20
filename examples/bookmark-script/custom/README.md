# 自定义打包

不通过 Cli 工具打包, 自行编写打包流程

### 使用

```ts
import { BookmarkScriptBuilder } from '@xiaohuohumax/bookmark-script';

const builder = new BookmarkScriptBuilder({});

const bml: BookmarkLinkExt = {
  name: 'test',
  href: './src/index.ts'
};

// 书签版
const bmScript: BuildScriptRes = await builder.buildBookmarkScript(bml);

// 控制台版本
const cScript = await builder.buildConsoleScript(bml);

// 网络版
const nScript = await builder.buildBookmarkNetworkScript({
  name: 'test',
  src: 'http://127.0.0.1:5500/dist/console.js',
  timeout: 5
});
```