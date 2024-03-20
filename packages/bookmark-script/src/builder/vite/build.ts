import { AliasOptions, InlineConfig, build as viteBuild } from 'vite';
import { ExternalOption, OutputChunk, OutputOptions, RollupOutput } from 'rollup';

import path from 'node:path';

/**
 * 打包代码配置
 */
export type BuildScriptOptions = Pick<
  InlineConfig,
  'logLevel' | 'plugins' | 'envDir' | 'envPrefix' | 'mode'
> & {
  /**
   * 入口
   */
  input: string
  /**
   * 输出配置
   */
  outputOptions?: OutputOptions
  /**
   * 排除模块
   */
  external?: ExternalOption
  /**
   * 路径别名
   */
  alias?: AliasOptions;
  /**
   * 是否压缩代码
   * 
   * @default false
   */
  minify?: boolean
}

/**
 * 打包结果
 */
export type BuildScriptRes = Pick<OutputChunk, 'code'>;

/**
 * 打包代码 vite
 * @param options 打包配置
 * @returns 打包结果
 */
export async function build(options: BuildScriptOptions): Promise<OutputChunk> {
  const {
    input, envDir, envPrefix, logLevel = 'error', plugins, outputOptions,
    external, alias, mode, minify
  } = options;

  const inlineConfig: InlineConfig = {
    logLevel,
    mode,
    envDir,
    envPrefix,
    plugins,
    resolve: {
      alias
    },
    build: {
      // 不写入文件
      write: false,
      // 禁用css拆分
      cssCodeSplit: true,
      // 静态资源内联
      assetsInlineLimit: () => true,
      minify: minify ? 'terser' : false,
      // 压缩配置
      terserOptions: {
        format: {
          // 排除全部注释
          comments: false,
        }
      },
      rollupOptions: {
        input,
        preserveEntrySignatures: 'strict',
        external,
        output: {
          name: path.basename(input),
          ...outputOptions
        },
      }
    }
  };
  const res = await viteBuild(inlineConfig);
  const rollupOutput = Array.isArray(res) ? res[0] : res;
  return (<RollupOutput>rollupOutput).output[0];
}
