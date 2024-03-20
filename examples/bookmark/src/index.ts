import fs from 'node:fs';
import { Builder } from '@xiaohuohumax/bookmark';
import path from 'node:path';

// 初始打包器
const buildBar = new Builder({});

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
]);

// 打包结果写入文件
const outDir = 'dist';
const outFile = path.resolve(outDir, 'favorites.html');

fs.mkdirSync(outDir);

fs.writeFileSync(outFile, htmlString);
