# 脚本扫描

脚本太多修改配置文件不方便, 则可配置扫描来构建

### 添加扫描配置

```ts
import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  scans: [{
    // 代扫描根路径
    root: 'src',
    // 书签/书签文件夹 信息前缀
    optionPrefix: '#',
    // 记载 书签文件夹信息 的文件名称
    folderFileName: 'bmf.txt'
  }]
});
```

### 书签脚本

脚本入口文件顶部添加注释信息, 以供扫描识别

```ts
/**
 * #name time tool
 * #version 1.0.0
 * #build true
 */

console.log('hello world');
```

### 书签文件夹

在文件夹下添加 `bmf.txt` 来记录 `书签文件夹信息`

```text
// bmf.txt
#name tool
#description some tool
#build true
```

### 说明

注释信息可用字段与 `bms` 配置相同