import { BuildOptions } from '@xiaohuohumax/bookmark';

import { BookmarkExt, BookmarkScriptBuilderOptions } from '../builder';
import { ScanScriptOptions } from './scan';
import { loadArgs } from '../args';

/**
 * 书签HTML打包配置
 */
export type BMBuildOptions = BuildOptions & {
  /**
   * 书签html模板
   * 
   * 模板中 `[[bookmark]]` 会被替换为构建的书签
   */
  htmlTemple?: string
}

/**
 * 书签脚本打包配置
 */
export interface BookmarkScriptOptions extends BookmarkScriptBuilderOptions {
  /**
   * 输出目录
   * 
   * @default 'dist'
   */
  outDir: string
  /**
   * 打包并发数
   * 
   * @default 10
   */
  buildLimit: number
  /**
   * 脚本目录
   */
  bms: BookmarkExt[]
  /**
   * 扫描脚本
   */
  scans?: ScanScriptOptions[],
  /**
   * 打包结果banner信息
   * 
   * 说明特殊模板: 使用书签信息可以通过 `[...]` 格式来使用
   * 
   * 例如:
   * 
   * ```text
   * 书签名称 => [name]
   * 书签描述 => [description]
   * ```
   * 
   * @default
   * /**
   *  * [name]
   *  *\/
   */
  banner?: string
  /**
   * 打包书签HTML配置
   */
  bmBuildOptions?: BMBuildOptions,
  /**
   * 脚本托管地址, 当此配置存在时额外构建网络版本
   * 
   * 网络版本:
   * 
   * + 优点: 书签代码大幅减少, 脚本代码保存到脚本托管地址
   * + 缺点: 每次都要请求脚本, 可能出现 CSP, Network 问题
   * 
   * 例如: https://cdn.jsdelivr.net/...
   */
  cdn?: string
  /**
   * cdn请求超时时间 秒
   * @default 5
   */
  cdnTimeout: number
}

/**
 * 默认配置
 */
const DEFINE_BOOKMARK_SCRIPT_OPTIONS: BookmarkScriptOptions = {
  outDir: 'dist',
  buildLimit: 10,
  bms: [],
  plugins: [],
  envDir: '',
  banner: `/**
 * [name]
 */`,
  cdnTimeout: 5
};

type BookmarkScriptOptionsPartial = Partial<BookmarkScriptOptions>

/**
 * 配置回调函数
 */
export type BookmarkScriptFunction = (options: {
  mode: string
})
  => Promise<BookmarkScriptOptionsPartial> | BookmarkScriptOptionsPartial

/**
 * 构建默认配置
 * @param options 书签脚本打包配置
 * @returns 书签脚本打包配置
 */
export async function defineConfig(
  options: BookmarkScriptOptionsPartial | BookmarkScriptFunction
) {
  if (options && typeof (options) == 'function') {
    const args = loadArgs();
    return await options({ mode: args.mode });
  }
  return options;
}

/**
 * 非数组对象包装成数组
 * @param target 对象
 * @returns 
 */
function arraify<T>(target: T | T[]): T[] {
  return Array.isArray(target) ? target : [target];
}

/**
 * 配置合并到源数据
 * @param oOptions 源配置
 * @param nOptions 新配置
 * @returns 
 */
export async function mergeConfig(
  defaults: BookmarkScriptOptionsPartial | Promise<BookmarkScriptOptionsPartial>,
  overrides: BookmarkScriptOptionsPartial | Promise<BookmarkScriptOptionsPartial>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged: Record<string, any> = { ...await defaults };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [key, value] of Object.entries(<Record<string, any>>await overrides)) {
    if (value == null) {
      continue;
    }

    const existing = merged[key];

    if (existing == null) {
      merged[key] = value;
      continue;
    }

    switch (key as keyof BookmarkScriptOptions) {
      case 'envDir':
      case 'envPrefix':
      case 'alias':
      case 'outDir':
      case 'buildLimit':
      case 'bmBuildOptions':
      case 'cdn':
      case 'mode':
      case 'cdnTimeout':
      case 'banner':
      case 'minify':
        merged[key] = value;
        break;
      case 'plugins':
      case 'scans':
      case 'bms':
        if (Array.isArray(value) || Array.isArray(existing)) {
          merged[key] = [...arraify(existing), ...arraify(value)];
        }
        break;
      default:
        break;
    }
  }

  return merged;
}

/**
 * 格式化配置补齐缺失参数
 * @param options 配置
 * @returns 
 */
export async function formatConfig(options: BookmarkScriptOptionsPartial) {
  return <BookmarkScriptOptions>(mergeConfig(DEFINE_BOOKMARK_SCRIPT_OPTIONS, options) as unknown);
}