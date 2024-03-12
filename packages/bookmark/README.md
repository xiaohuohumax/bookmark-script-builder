# @xiaohuohumax/bookmark

**浏览器书签构建**

## 下载

```shell
npm i @xiaohuohumax/bookmark
```

## 使用

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

## 构建结果

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<style>
  /* ... */
</style>
<TITLE>Bookmark Script</TITLE>
<H1>Bookmark Script</H1>
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

## 最后

玩的开心 🎉🎉🎉🎉