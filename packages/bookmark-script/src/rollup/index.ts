import { ExternalOption, OutputChunk, OutputOptions, Plugin, rollup } from 'rollup';
import commonjs, { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import resolve, { DEFAULTS, RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import replace, { RollupReplaceOptions } from '@rollup/plugin-replace';
import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';

import path from 'node:path';

export interface DefinePluginOptions {
  rollupReplaceOptions?: RollupReplaceOptions
  rollupCommonJSOptions?: RollupCommonJSOptions
  rollupNodeResolveOptions?: RollupNodeResolveOptions
  rollupBabelInputPluginOptions?: RollupBabelInputPluginOptions
}

/**
 * rollup打包配置参数
 */
export interface BuildScriptOptions {
  input: string
  plugins?: Plugin[],
  outputOptions?: OutputOptions
  external?: ExternalOption
  definePluginOptions?: DefinePluginOptions
}

/**
 * 正常打包输出结果
 */
export type BuildScriptRes = OutputChunk;

/**
 * 创建rollup打包器
 * @param options rollup打包配置参数
 * @returns 打包输出结果
 */
async function createRollupBuilder(options: BuildScriptOptions) {
  const { input, external, definePluginOptions, plugins } = options;
  return await rollup({
    input,
    external,
    plugins: [
      commonjs({
        include: /node_modules/,
        ...definePluginOptions?.rollupCommonJSOptions
      }),
      resolve({
        browser: true,
        preferBuiltins: true,
        exportConditions: [...DEFAULTS.extensions, '.ts'],
        ...definePluginOptions?.rollupNodeResolveOptions
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        ...definePluginOptions?.rollupBabelInputPluginOptions
      }),
      replace({
        preventAssignment: true,
        ...definePluginOptions?.rollupReplaceOptions,
        values: {
          __dirname: (id) => JSON.stringify(path.dirname(id)),
          __filename: (id) => JSON.stringify(id),
          ...definePluginOptions?.rollupReplaceOptions?.values
        }
      }),
      ...plugins ?? [],
    ],
  });
}

/**
 * 打包代码
 * @param options 打包配置
 * @returns 打包结果
 */
export async function buildScript(options: BuildScriptOptions): Promise<BuildScriptRes> {
  const bunde = await createRollupBuilder(options);
  const { output } = await (bunde.generate)({
    format: 'iife',
    ...options.outputOptions,
  });
  return output[0];
}