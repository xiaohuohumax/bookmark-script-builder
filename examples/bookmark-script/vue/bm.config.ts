import { defineConfig } from '@xiaohuohumax/bookmark-script';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  scans: [{
    root: 'src'
  }]
});
