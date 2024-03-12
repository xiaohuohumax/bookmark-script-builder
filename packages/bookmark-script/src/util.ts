import mime from 'mime-types';

import fs from 'node:fs';

/**
 * 文件转base64
 * @param file 图片文件
 * @returns base64格式字符串
 */
export function fileToBase64(file: string) {
  const fileBase64 = fs.readFileSync(file).toString('base64');
  return `data:${mime.lookup(file)};base64,${fileBase64}`;
}