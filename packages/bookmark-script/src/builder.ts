import terser, { Options as terserOptions } from '@rollup/plugin-terser';
import { BookmarkLink as BML, BookmarkFolder as BF, BuildOptions } from '@xiaohuohumax/bookmark';
import { Plugin } from 'rollup';

import { buildScript, BuildScriptRes, DefinePluginOptions } from './rollup';
import meta from './rollup/plugins/virtual';

export { isBookmarkFolder, isBookmarkLink } from '@xiaohuohumax/bookmark';

/**
 * 书签
 */
export interface BookmarkLinkExt extends BML {
  isBuild?: boolean
  version?: string
  /**
   * 书签描述
   */
  description?: string
}

/**
 * 文件夹
 */
export interface BookmarkFolderExt<C = BookmarkExt> extends BF<C> {
  isBuild?: boolean
  /**
   * 书签描述
   */
  description?: string
}

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
   * 依据书签信息替换banner的信息
   * @param bml 书签信息
   * @returns 书签banner
   */
  private bmlToBanner(bml: BookmarkLinkExt) {
    if (!this.options.banner) {
      return this.options.banner;
    }
    let banner: string = this.options.banner;
    for (const [key, value] of Object.entries(bml)) {
      banner = banner.replace(`[${key}]`, () => value);
    }

    return banner;
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
        meta(BOOKMARK_META, bml),
        ...this.options.plugins
      ],
      definePluginOptions: this.options.definePluginOptions,
    });
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
        meta(BOOKMARK_META, bml),
        terser(<terserOptions>{
          format: {
            comments: false
          }
        }),
        ...this.options.plugins
      ],
      definePluginOptions: this.options.definePluginOptions,
    });
    if ('error' in res) {
      return { error: res.error };
    }
    const code = `javascript:${encodeURI(res.code)}void(0);`;
    return { code };
  }
}