import { defineConfig } from 'rollup';

import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

import { builtinModules } from 'node:module';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));

const entries = {
  index: 'src/index.ts',
  cli: 'src/cli/index.ts',
  options: 'src/cli/options.ts',
  builder: 'src/builder/index.ts'
};

const dEnties = Object.assign({}, entries);

delete dEnties['cli'];

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * Copyright (c) 2020-present ${pkg.author}
 * @license ${pkg.license}
 */`;

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...builtinModules,
  'node:url',
  'node:path',
  'node:fs',
  'yargs/helpers'
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
    plugins: [json(), esbuild(), copy({
      targets: [
        {
          src: 'src/builder/inject/script.ts',
          dest: 'dist/inject'
        }
      ]
    })],
    external
  },
  {
    input: entries,
    output: {
      dir: 'dist',
      banner,
      format: 'cjs',
      entryFileNames: '[name].cjs',
    },
    plugins: [json(), esbuild()],
    external
  },
  {
    input: dEnties,
    output: {
      dir: 'dist',
      banner,
      entryFileNames: '[name].d.ts',
      format: 'esm',
    },
    plugins: [
      dts({ respectExternal: true }),
    ],
    external
  }
]);