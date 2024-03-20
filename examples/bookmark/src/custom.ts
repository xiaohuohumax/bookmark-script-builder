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
