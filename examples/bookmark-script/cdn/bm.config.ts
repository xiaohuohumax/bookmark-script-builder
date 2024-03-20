import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  scans: [{
    root: 'src'
  }],
  // cdn 地址
  cdn: 'http://127.0.0.1:5500/dist/',
  // 请求超时时间
  cdnTimeout: 5
});