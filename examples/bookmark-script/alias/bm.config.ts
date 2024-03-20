import { defineConfig } from '@xiaohuohumax/bookmark-script';
import path from 'node:path';

export default defineConfig({
  scans: [{
    root: 'src'
  }],
  alias: {
    '#': path.resolve(import.meta.dirname, 'util')
  }
});