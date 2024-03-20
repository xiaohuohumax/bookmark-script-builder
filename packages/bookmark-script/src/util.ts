import mime from 'mime-types';

import fs from 'node:fs';

/**
 * 文件转base64字符串
 * @param file 文件路径
 * @returns base64字符串
 */
export function fileToBase64(file: string): string {
  return `data:${mime.lookup(file)};base64,${fs.readFileSync(file).toString('base64')}`;
}

/**
 * 判断链接是否是网址
 * @param url 链接字符串
 * @returns 
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}