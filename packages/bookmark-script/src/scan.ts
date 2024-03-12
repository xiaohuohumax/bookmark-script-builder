import { transformFileSync } from '@babel/core';
import presetTypescript from '@babel/preset-typescript';
import chalk from 'chalk';

import { BookmarkExt, BookmarkFolderExt, BookmarkLinkExt } from './builder';

import nodePath from 'node:path';
import fs from 'node:fs';

/**
 * 扫描配置
 */
export interface ScanScriptOptions {
  /**
   * 扫描路径
   */
  root: string
  /**
   * 扫描后缀名
   */
  extensions?: string[]
  /**
   * 注释前缀
   */
  optionPrefix?: string
  /**
   * 文件夹标识文件名称
   */
  folderFileName?: string
}

/**
 * 扫描配置默认值
 */
export const DEFINE_SCAN_SCRIPT_OPTIONS: Required<ScanScriptOptions> = {
  root: 'src',
  extensions: ['.ts', '.js'],
  optionPrefix: '#',
  folderFileName: 'bmf.txt'
};

const optionRe = /^(\w+)\s+(.*)$/i;
const enterRe = /\r?\n/i;

/**
 * 注释转书签信息
 * @param lines 注释
 * @param optionPrefix 注释前缀
 * @returns 
 */
function linesToBM(lines: string[], optionPrefix: string): {
  [key: string]: string
} {
  const op = lines.map(l => l.trimStart())
    .filter(l => l.trim() != '')
    .filter(l => l.startsWith(optionPrefix))
    .map(l => l.slice(1))
    .map(l => {

      const match = l.match(optionRe);
      return match ? { [match[1]]: match[2] } : {};
    });
  op.push({});

  return op.reduce((o1, o2) => ({ ...o1, ...o2 }));
}

/**
 * 注释文件转书签文件夹
 * @param file 注释文件
 * @param optionPrefix 注释前缀
 * @returns 
 */
function folderFileToBFE(file: string, optionPrefix: string): BookmarkFolderExt {
  const data = fs.readFileSync(file, 'utf-8');

  const options = linesToBM(data.split(enterRe), optionPrefix);

  const res: BookmarkFolderExt = {
    name: '',
    children: []
  };

  for (const [key, value] of Object.entries(options)) {
    const bmlKey = <keyof BookmarkFolderExt>key;
    switch (bmlKey) {
      case 'description':
      case 'name': {
        res[bmlKey] = value.trim();
        break;
      }
      // case 'children':
      case 'isBuild': {
        const isBuild = JSON.parse(value);
        if (typeof (isBuild) === 'boolean') {
          res[bmlKey] = isBuild;
        }
        break;
      }
    }
  }
  return res;
}

/**
 * 脚本文件注释转书签信息
 * @param file 脚本文件
 * @param optionPrefix 注释前缀
 * @returns 
 */
function scriptFileToBLE(file: string, optionPrefix: string): BookmarkLinkExt | null {

  try {
    const scriptAst = transformFileSync(file, {
      sourceType: 'unambiguous',
      ast: true,
      presets: [presetTypescript]
    });
    if (!scriptAst?.ast?.comments) {
      return null;
    }
    for (const { type, value } of scriptAst.ast.comments) {
      // 只接受第一个多行注释
      if (type === 'CommentBlock') {
        const lines: string[] = value.split(enterRe);
        const res: BookmarkLinkExt = {
          name: '',
          href: file
        };

        const bm = linesToBM(lines.map(l => l.replace(/^\s*\*\s+/i, () => '')), optionPrefix);
        if (!('name' in bm)) {
          return null;
        }

        for (const [key, value] of Object.entries(bm)) {
          const bmlKey = <keyof BookmarkLinkExt>key;
          switch (bmlKey) {
            case 'name':
            case 'description':
            case 'version': {
              res[bmlKey] = value.trim();
              break;
            }
            case 'isBuild': {
              const isBuild = JSON.parse(value);
              if (typeof (isBuild) === 'boolean') {
                res[bmlKey] = isBuild;
              }
              break;
            }
            // case 'href':
            case 'icon': {
              res[bmlKey] = nodePath.resolve(nodePath.dirname(file), value.trim());
              break;
            }
          }
        }
        return res;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}

/**
 * 递归扫描文件夹
 * @param root 扫描路径
 * @param options 配置
 * @returns 
 */
function loopScan(root: string, options: Required<ScanScriptOptions>): BookmarkExt[] {
  const res: BookmarkExt[] = [];
  for (const { path, name } of fs.readdirSync(root, { withFileTypes: true })) {
    const file = nodePath.resolve(path, name);

    const stat = fs.statSync(file);

    if (stat.isDirectory()) {
      res.push(...loopScan(file, options));
      continue;
    }

    if (stat.isFile() && options.extensions.includes(nodePath.extname(name))) {
      const bm = scriptFileToBLE(file, options.optionPrefix);
      if (bm) {
        res.push(bm);
        console.log(chalk.greenBright('📄 Find:'), chalk.grey(bm.name), chalk.blue('=>'), chalk.grey(file));
      } else {
        console.log(chalk.yellowBright('📄 Ignore:'), chalk.grey(file));
      }
    }
  }
  const folderFile = nodePath.resolve(root, options.folderFileName);
  if (fs.existsSync(folderFile)) {
    const bfe = folderFileToBFE(folderFile, options.optionPrefix);
    bfe.children = res;
    console.log(chalk.greenBright('📂 Find:'), chalk.grey(bfe.name), chalk.blue('=>'), chalk.grey(folderFile));
    return [bfe];
  }
  return res;
}

/**
 * 扫描文件夹获取书签树
 * @param options 扫描配置
 * @returns 书签树
 */
export function scanScript(options: ScanScriptOptions): BookmarkExt[] {
  try {
    const op: Required<ScanScriptOptions> = Object.assign(DEFINE_SCAN_SCRIPT_OPTIONS, options);
    console.log(chalk.yellow(`[[Scan script start]]: ${op.root}`));
    return loopScan(nodePath.resolve(op.root), op);
  } finally {
    console.log('');
  }
}
