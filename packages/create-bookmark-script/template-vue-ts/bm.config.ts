import { defineConfig } from '@xiaohuohumax/bookmark-script';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  scans: [{ root: 'src' }],
  plugins:[vue()]
});