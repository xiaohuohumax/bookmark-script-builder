import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import { builtinModules } from 'node:module';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));

const entries = {
  index: 'src/index.ts',
  cli: 'src/client/index.ts',
  options: 'src/client/options.ts',
  env: 'src/env.ts',
  args: 'src/args.ts',
  builder: 'src/builder.ts',
  scan: 'src/scan.ts'
};

const minEnties = Object.assign({}, entries);

delete minEnties['cli'];

const banner = `/**
 * ${packageJson.name} ${packageJson.version}
 * Copyright (c) 2020-present ${packageJson.author}
 * @license ${packageJson.license}
 */`;

function initPlugins(minify = false) {
  return [
    json(),
    esbuild({ minify })
  ];
}

const external = [
  '@xiaohuohumax/bookmark',
  ...builtinModules,
  'node:url',
  'node:fs',
  'node:path',

  'rollup',
  '@rollup/plugin-json',
  '@rollup/plugin-commonjs',
  '@rollup/plugin-node-resolve',
  '@rollup/plugin-alias',
  '@rollup/plugin-replace',
  '@rollup/plugin-terser',
  '@rollup/plugin-babel',

  'yargs',
  'yargs/helpers',
  'dotenv',
  'dotenv-parse-variables',
  'p-limit',
  'mime-types',
  'chalk',
  'progress',

  '@babel/core',
  '@babel/preset-typescript'
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
    plugins: initPlugins(),
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
    plugins: initPlugins(),
    external
  },
  {
    input: minEnties,
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