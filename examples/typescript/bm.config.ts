import { defineConfig, scanScript } from '@xiaohuohumax/bookmark-script';
import { name, author, version } from './package.json';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig({
  outDir: 'dist',
  banner: `/**
  * [name] [version]
  * [description]
  * Copyright (c) 2020-present xiaohuohumax
  * Power by ${name} ${version} ${author}
  * @license MIT
  */`,
  bms: scanScript({
    root: 'src',
    optionPrefix: '#',
    folderFileName: 'bmf.txt'
  }),
  plugins: [
    typescript({ check: false })
  ],
});