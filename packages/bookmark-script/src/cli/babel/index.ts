import { transformFileSync } from '@babel/core';
import typescript from '@babel/preset-typescript';

/**
 * 通过AST获取脚本文件的注释信息
 * @param file 脚本文件路径
 * @returns 块注释信息
 */
export function astScriptCommentBlocks(file: string): string[] {
  try {
    const ast = transformFileSync(
      file,
      {
        sourceType: 'unambiguous',
        ast: true,
        presets: [typescript]
      }
    );
    if (ast?.ast?.comments) {
      return ast.ast.comments
        .filter(c => c.type == 'CommentBlock')
        .map(c => c.value);
    }
  } catch (_) { }
  return [];
}