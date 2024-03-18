import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import { builtinModules } from 'node:module';
import fs from 'node:fs';
import raw from '@xiaohuohumax/rollup-plugin-raw';

const packageJson = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));

const entries = {
  index: './src/index.ts'
};

const banner = `/**
 * ${packageJson.name} ${packageJson.version}
 * Copyright (c) 2020-present ${packageJson.author}
 * @license ${packageJson.license}
 */`;

function initPlugins(minify = false) {
  return [
    json(),
    raw(),
    esbuild({ minify }),
  ];
}

const external = [
  ...builtinModules
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
    input: entries,
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
  },
  {
    input: entries,
    output: {
      dir: 'dist',
      banner,
      format: 'umd',
      name: 'Bookmark',
      entryFileNames: 'bookmark.min.js'
    },
    plugins: initPlugins(true),
    external
  },
]);