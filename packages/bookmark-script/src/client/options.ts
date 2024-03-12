/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookmarkExt, BookmarkScriptBuilderOptions } from '../builder';
import { loadArgs } from '../args';

/**
 * 书签脚本打包配置
 */
export interface BookmarkScriptOptions extends BookmarkScriptBuilderOptions {
  /**
   * 输出目录
   */
  outDir: string
  /**
   * 环境变量目录
   */
  env: string
  /**
   * 打包并发数
   */
  buildLimit: number
  /**
   * 脚本目录
   */
  bms: BookmarkExt[]
}

/**
 * 默认配置
 */
const DEFINE_BOOKMARK_SCRIPT_OPTIONS: BookmarkScriptOptions = {
  outDir: 'dist',
  env: '',
  buildLimit: 10,
  bms: [],
  plugins: [],
  definePluginOptions: {}
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
  const merged: Record<string, any> = { ...await defaults };

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
      case 'banner':
      case 'outDir':
      case 'env':
      case 'buildLimit':
      case 'definePluginOptions':
      case 'bmBuildOptions':
        merged[key] = value;
        continue;
      case 'bms':
      case 'plugins':
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