import { defineConfig } from '@xiaohuohumax/bookmark-script';
import { name, author, version } from './package.json';

export default defineConfig({
  // 输出路径
  outDir: 'dist',
  // 添加注释
  banner: `/**
  * [name] [version]
  * [description]
  * Copyright (c) 2020-present xiaohuohumax
  * Power by ${name} ${version} ${author}
  * @license MIT
  */`,
  // 书签树
  bms: [
    {
      name: '显示当前时间',
      description: '',
      version: '',
      href: './src/index.js',
      icon: './static/clock.png'
    }
  ]
});