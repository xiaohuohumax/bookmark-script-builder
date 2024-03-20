import { PluginOption } from 'vite';

import { ScriptBuilderOptions, InjectScript, ScriptBuilder } from '../scriptBuilder';
import { BookmarkLinkExt } from '../bookmarkExt';
import { BuildScriptRes, build as viteBuild } from './build';
import virtual from './plugins/virtual';

import path from 'node:path';

const BOOKMARK_META: string = 'bookmark:meta';
const INJECT_SCRIPT: string = 'inject:script';

/**
 * 环境变量默认前缀
 */
export const ENV_PREFIX_DEFINE = 'BM_';

/**
 * 压缩默认配置
 */
export const MINIFY_DEFINE = true;

/**
 * vite打包器配置
 */
export type ViteBookmarkScriptBuilderOptions = ScriptBuilderOptions & {
  /**
   * 插件
   */
  plugins?: PluginOption[]
  /**
   * 路径别名
   */
  alias?: { [find: string]: string }
  /**
   * 环境变量文件夹路径
   */
  envDir?: string
  /**
   * 环境变量前缀名称
   * 
   * @default 'BM_'
   */
  envPrefix?: string
  /**
   * 打包模式
   */
  mode?: string
  /**
   * 是否压缩
   * 
   * @default true
   */
  minify?: boolean
}

/**
 * 书签脚本打包器 Vite 实现
 */
export class ViteBookmarkScriptBuilder extends ScriptBuilder {

  constructor(protected options: ViteBookmarkScriptBuilderOptions) {
    super(options);
    if (typeof (this.options.envPrefix) != 'string') {
      this.options.envPrefix = ENV_PREFIX_DEFINE;
    }
    if (typeof (this.options.minify) != 'boolean') {
      this.options.minify = MINIFY_DEFINE;
    }
  }

  /**
   * 打包代码
   * @param bml 书签链接
   * @param minify 是否压缩混淆
   * @returns 
   */
  private async buildScript(bml: BookmarkLinkExt, minify: boolean = false) {
    const { plugins = [], alias, envDir, envPrefix, mode } = this.options;
    return await viteBuild({
      input: bml.href,
      alias,
      mode,
      envDir,
      envPrefix,
      minify,
      outputOptions: {
        format: 'iife'
      },
      plugins: [
        virtual(BOOKMARK_META, bml),
        ...plugins
      ],
    });
  }

  /**
   * 打包控制台版脚本
   * @param bml 书签链接
   * @returns 
   */
  public async buildConsoleScript(bml: BookmarkLinkExt): Promise<BuildScriptRes> {

    const minify = typeof (bml.minify) == 'boolean'
      ? bml.minify
      : this.options.minify;

    // 默认不压缩/不混淆代码
    return this.buildScript(bml, minify);
  }

  /**
   * 打包网络版脚本
   * @param inject 注入脚本信息
   * @returns 
   */
  public async buildBookmarkNetworkScript(inject: InjectScript): Promise<BuildScriptRes> {
    const res = await viteBuild({
      input: path.resolve(import.meta.dirname, './inject/script.ts'),
      minify: true,
      outputOptions: {
        format: 'iife'
      },
      plugins: [
        virtual(INJECT_SCRIPT, inject),
      ],
    });
    return { ...res, code: `javascript:${encodeURIComponent(res.code)}void(0);` };
  }

  /**
   * 打包书签版脚本
   * @param bml 书签链接
   * @returns 
   */
  public async buildBookmarkScript(bml: BookmarkLinkExt): Promise<BuildScriptRes> {
    const res = await this.buildScript(bml, true);
    return { ...res, code: `javascript:${encodeURIComponent(res.code)}void(0);` };
  }
}