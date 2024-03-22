import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';

import { builtinModules } from 'node:module';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));

const entries = {
  index: 'src/index.ts',
};

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * Copyright (c) 2020-present ${pkg.author}
 * @license ${pkg.license}
 */`;

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...builtinModules,
  'node:path',
  'node:fs',
];

export default defineConfig([
  {
    input: entries,
    output: {
      dir: 'dist',
      banner,
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    plugins: [
      esbuild()
    ],
    external
  }
]);