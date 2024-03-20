import { BookmarkLinkExt, BookmarkScriptBuilder, BuildScriptRes } from '@xiaohuohumax/bookmark-script';

import fs from 'node:fs';
import path from 'node:path';

const builder = new BookmarkScriptBuilder({ minify: false });

(async () => {
  const dist = path.resolve('dist');

  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  const bml: BookmarkLinkExt = {
    name: 'test',
    href: './src/index.ts'
  };

  // 离线版
  const bmScript: BuildScriptRes = await builder.buildBookmarkScript(bml);
  fs.writeFileSync(path.resolve(dist, 'bookmark.txt'), bmScript.code, 'utf-8');

  // 控制台版
  const cScript = await builder.buildConsoleScript(bml);
  fs.writeFileSync(path.resolve(dist, 'console.js'), cScript.code, 'utf-8');

  // 网络版
  const nScript = await builder.buildBookmarkNetworkScript({
    name: 'test',
    src: 'http://127.0.0.1:5500/dist/console.js',
    timeout: 5
  });
  fs.writeFileSync(path.resolve(dist, 'bookmark-network.txt'), nScript.code, 'utf-8');

  console.log('\nSuccess !!!');
})();
