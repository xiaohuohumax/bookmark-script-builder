import { defineConfig } from '@xiaohuohumax/bookmark-script';
import react from '@vitejs/plugin-react';

export default defineConfig({
  scans: [{ root: 'src' }],
  plugins: [react()]
});