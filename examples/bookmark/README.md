# 浏览器书签构建

## 默认构建

```ts
import fs from 'node:fs';
import { Builder } from '@xiaohuohumax/bookmark';

const buildBar = new Builder({});

const htmlString = buildBar.buildHTMLString([
  {
    name: '搜索',
    children: [
      {
        name: 'baidu',
        href: 'https://www.baidu.com',
        icon: 'https://www.baidu.com/favicon.ico'
      }
    ]
  }
]);

fs.writeFileSync('favorites.html', htmlString);
```
**结果**

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<style>
  /* ... */
</style>
<TITLE>Bookmarklet</TITLE>
<H1>Bookmarklet</H1>
<DL><p>
    <DT><H3 PERSONAL_TOOLBAR_FOLDER="true"></H3>
    <DL><p>
        <DT><H3>搜索</H3>
        <DL><p>
            <DT><A HREF="https://www.baidu.com" ICON="https://www.baidu.com/favicon.ico">baidu</A>
        </DL><p>
    </DL><p>
</DL><p>
<script>
  // ...
</script>
```

## 自定义HTML

```ts
import fs from 'node:fs';
import { Builder, RenderHTMLCallbackFuntion } from '@xiaohuohumax/bookmark';
import path from 'node:path';

// 初始打包器
const buildBar = new Builder({});

const renderCallback: RenderHTMLCallbackFuntion = ({ bookmark }) => {
  // 将构建好的 `书签` 写入自定义的HTML中
  return fs.readFileSync('./src/custom.html', 'utf-8')
    .replaceAll('[[bookmark]]', () => bookmark);
};

const htmlString = buildBar.buildHTMLString([
  {
    // 文件夹
    name: '搜索',
    children: [
      {
        // 脚本
        name: 'baidu',
        href: 'https://www.baidu.com',
        icon: 'https://www.baidu.com/favicon.ico'
      }
    ]
  }
], renderCallback);

// 打包结果写入文件
const outDir = 'dist';
const outFile = path.resolve(outDir, 'favorites-custom.html');

fs.writeFileSync(outFile, htmlString);
```
**模板** ./src/custom.html

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Custom Bookmarklet</TITLE>
<H1>Custom Bookmarklet</H1>
[[bookmark]]
```

**结果**

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Custom Bookmarklet</TITLE>
<H1>Custom Bookmarklet</H1>
<DL><p>
    <DT><H3 PERSONAL_TOOLBAR_FOLDER="true"></H3>
    <DL><p>
        <DT><H3>搜索</H3>
        <DL><p>
            <DT><A HREF="https://www.baidu.com" ICON="https://www.baidu.com/favicon.ico">baidu</A>
        </DL><p>
    </DL><p>
</DL><p>
```