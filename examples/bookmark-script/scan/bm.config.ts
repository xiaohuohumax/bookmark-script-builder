import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  scans: [{
    root: 'src',
    optionPrefix: '#',
    folderFileName: 'bmf.txt'
  }]
});