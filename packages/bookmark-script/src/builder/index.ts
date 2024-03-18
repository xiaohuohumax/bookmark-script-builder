import terser, { Options as terserOptions } from '@rollup/plugin-terser';
import { BookmarkLink as BML, BookmarkFolder as BF, BuildOptions } from '@xiaohuohumax/bookmark';
import { Plugin } from 'rollup';

import { buildScript, BuildScriptRes, DefinePluginOptions } from '../rollup';
import virtual from '../rollup/plugins/virtual';
import path from 'path';
import { InjectScript } from './inject';
import { fileURLToPath } from 'url';

export { isBookmarkFolder, isBookmarkLink } from '@xiaohuohumax/bookmark';

/**
 * 书签
 */
export interface BookmarkLinkExt extends BML {
  /**
   * 是否构建
   */
  isBuild?: boolean
  /**
   * 版本
   */
  version?: string
  /**
   * 书签描述
   */
  description?: string
  /**
   * 打包模式
   * 
   * online: 全部依赖一起打包
   * offline: 非必要依赖不打包
   */
  mode?: 'online' | 'offline'
}

/**
 * 文件夹
 */
export interface BookmarkFolderExt<C = BookmarkExt> extends BF<C> {
  /**
   * 是否构建
   */
  isBuild?: boolean
  /**
   * 书签描述
   */
  description?: string
}

/**
 * 书签
 */
export type BookmarkExt = BookmarkFolderExt | BookmarkLinkExt


export type BMBuildOptions = BuildOptions & {
  /**
   * 书签html模板
   * 
   * 模板中 `[[bookmark]]` 会被替换为构建的书签
   */
  htmlTemple?: string
}

export const BOOKMARK_META: string = 'bookmark:meta';
const INJECT_SCRIPT: string = 'inject:script';

/**
 * 书签脚本打包配置
 */
export interface BookmarkScriptBuilderOptions {
  /**
   * 打包显示的 banner
   * 
   * 当前脚本的 信息@see {BookmarkLinkExt}
   * 可通过[info]的格式获取
   * 
   * 比如:
   * [name] 名称
   * [description] 描述
   */
  banner?: string
  /**
   * 打包扩展插件 rollup
   */
  plugins: Plugin[]
  /**
   * 书签打包配置
   */
  bmBuildOptions?: BMBuildOptions
  /**
   * 默认插件的配置
   */
  definePluginOptions: DefinePluginOptions
}

/**
 * 书签脚本打包器
 */
export class BookmarkScriptBuilder {

  constructor(
    private options: BookmarkScriptBuilderOptions,
    env: {
      [key: string]: string
    }) {
    const { definePluginOptions } = this.options;
    if (!definePluginOptions.rollupReplaceOptions) {
      definePluginOptions.rollupReplaceOptions = {};
    }

    Object.entries(env).forEach(e => this.addMetaEnv(e[0], e[1]));
  }

  /**
   * 添加环境变量
   * @param key 环境变量名称
   * @param value 环境变量值
   */
  private addMetaEnv(key: string, value: unknown) {
    const replace = this.options.definePluginOptions.rollupReplaceOptions!;
    if (!replace.values) {
      replace.values = {};
    }
    replace.values['import.meta.env.' + key] = JSON.stringify(value);
  }

  /**
   * 打包 控制台 版本代码
   * @param bml 书签信息
   * @returns 打包结果
   */
  public async buildConsoleScript(bml: BookmarkLinkExt): Promise<BuildScriptRes> {
    return await buildScript({
      input: bml.href,
      plugins: [
        virtual(BOOKMARK_META, bml),
        ...this.options.plugins
      ],
      definePluginOptions: this.options.definePluginOptions,
    });
  }

  /**
   * 打包 网络书签 版本代码
   * @param inject 网络链接信息
   * @returns 打包结果
   */
  public async buildBookmarkNetworkScript(inject: InjectScript): Promise<BuildScriptRes> {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const res = await buildScript({
      input: path.resolve(__dirname, './inject/script.ts'),
      plugins: [
        virtual(INJECT_SCRIPT, inject),
        terser(),
      ],
    });
    return { ...res, code: `javascript:${encodeURIComponent(res.code)}void(0);` };
  }

  /**
   * 打包 书签 版本代码
   * @param bml 书签信息
   * @returns 打包结果
   */
  public async buildBookmarkScript(bml: BookmarkLinkExt): Promise<BuildScriptRes> {
    const res = await buildScript({
      input: bml.href,
      plugins: [
        virtual(BOOKMARK_META, bml),
        terser(<terserOptions>{
          format: {
            comments: false
          }
        }),
        ...this.options.plugins
      ],
      definePluginOptions: this.options.definePluginOptions,
    });
    return { ...res, code: `javascript:${encodeURIComponent(res.code)}void(0);` };
  }
}