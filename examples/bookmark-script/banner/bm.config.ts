import { defineConfig } from '@xiaohuohumax/bookmark-script';
import { author, version, name, license } from './package.json';

export default defineConfig({
  banner: `/**
 * [name] [version]
 * [description]
 * 
 * href: [href]
 * icon: [icon]
 * 
 * Create time: [time]
 * Build mode: [mode]
 * 
 * Power by ${name} ${version}
 * Copyright (c) 2020-present ${author}
 * @license ${license}
 */`,
  scans: [{
    root: 'src'
  }]
});