import { defineConfig } from '@xiaohuohumax/bookmark-script';

export default defineConfig({
  envDir: 'env',
  envPrefix: 'BM_',
  scans: [{
    root: 'src'
  }]
});