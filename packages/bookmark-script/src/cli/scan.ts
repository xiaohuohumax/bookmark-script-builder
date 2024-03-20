import chalk from 'chalk';

import { BookmarkExt, BookmarkFolderExt, BookmarkLinkExt } from '../builder';
import { astScriptCommentBlocks } from './babel';

import nodePath from 'node:path';
import fs from 'node:fs';

const OPTION_RE = /^(\w+)\s+(.*)$/i;
const ENTER_RE = /\r?\n/i;

/**
 * 依据配置前缀组装配置信息
 * @param lines 注释
 * @param optionPrefix 配置前缀
 * @returns 配置信息
 */
function lineToOptions(lines: string[], optionPrefix: string): { [key: string]: string } {
  const op = lines.map(l => l.trimStart())
    .filter(l => l.trim() != '')
    .filter(l => l.startsWith(optionPrefix))
    .map(l => l.slice(1))
    .map(l => {
      const match = l.match(OPTION_RE);
      return match ? { [match[1]]: match[2] } : {};
    });
  return op.reduce((o1, o2) => ({ ...o1, ...o2 }), {});
}

/**
 * 通过配置前缀获取文件夹配置信息
 * @param file 文件夹标识文件路径
 * @param optionPrefix 配置前缀
 * @returns 文件夹配置信息
 */
function folderFileToBFE(file: string, optionPrefix: string): BookmarkFolderExt | void {

  const data = fs.readFileSync(file, 'utf-8');
  const lines = data.split(ENTER_RE);
  const options = lineToOptions(lines, optionPrefix);

  if (!('name' in options)) {
    return;
  }

  const res: BookmarkFolderExt = {
    name: '',
    children: []
  };

  for (const [key, value] of Object.entries(options)) {
    const bfeKey = <keyof BookmarkFolderExt>key;
    switch (bfeKey) {
      case 'description':
      case 'name':
        res[bfeKey] = value.trim();
        break;
      // case 'children':
      case 'build': {
        const build = JSON.parse(value);
        if (typeof (build) === 'boolean') {
          res[bfeKey] = build;
        }
        break;
      }
    }
  }
  return res;
}

/**
 * 通过配置前缀获取脚本配置信息
 * @param file 脚本文件路径
 * @param optionPrefix 配置前缀
 * @returns 脚本配置信息
 */
function scriptFileToBLE(file: string, optionPrefix: string): BookmarkLinkExt | void {
  const comment = astScriptCommentBlocks(file)[0];
  if (!comment) {
    return;
  }

  const lines = comment
    .split(ENTER_RE)
    .map(l => l.replace(/^\s*\*\s+/i, () => ''));

  const options = lineToOptions(lines, optionPrefix);

  if (!('name' in options)) {
    return;
  }

  const res: BookmarkLinkExt = {
    name: '',
    href: file
  };

  for (const [key, value] of Object.entries(options)) {
    const bleKey = <keyof BookmarkLinkExt>key;
    switch (bleKey) {
      case 'name':
      case 'description':
      case 'icon':
      case 'version':
        res[bleKey] = value.trim();
        break;
      case 'minify':
      case 'build': {
        const b = JSON.parse(value);
        if (typeof (b) === 'boolean') {
          res[bleKey] = b;
        }
        break;
      }
      default:
        break;
    }
  }
  return res;
}

/**
 * 递归扫描文件夹
 * @param root 扫描路径
 * @param options 扫描配置
 * @returns 
 */
export function loopScan(root: string, options: Required<ScanScriptOptions>): BookmarkExt[] {
  const res: BookmarkExt[] = [];
  const files = fs.readdirSync(root, { withFileTypes: true });

  for (const { path, name } of files) {

    const file = nodePath.resolve(path, name);
    const stat = fs.statSync(file);

    if (stat.isDirectory()) {
      res.push(...loopScan(file, options));
      continue;
    }

    if (!options.extensions.includes(nodePath.extname(name))) {
      continue;
    }

    const bm = scriptFileToBLE(file, options.optionPrefix);
    if (bm) {
      res.push(bm);
      console.log(
        chalk.greenBright('📄 Find:'),
        chalk.gray(bm.name),
        chalk.blue('=>'),
        chalk.gray(bm.href)
      );
    }
  }

  const folderFile = nodePath.resolve(root, options.folderFileName);
  if (fs.existsSync(folderFile)) {

    const bfe = folderFileToBFE(folderFile, options.optionPrefix);
    if (bfe) {
      bfe.children = res;
      console.log(
        chalk.greenBright('📂 Find:'),
        chalk.gray(bfe.name),
        chalk.blue('=>'),
        chalk.gray(folderFile)
      );
      return [bfe];
    }
  }
  return res;
}

/**
 * 扫描配置
 */
export interface ScanScriptOptions {
  /**
   * 扫描路径
   * 
   * @default 'src'
   */
  root: string
  /**
   * 扫描后缀名
   * 
   * @default ['.mjs', '.js', '.mts', '.ts', '.tsx', '.jsx']
   */
  extensions?: string[]
  /**
   * 注释前缀
   * 
   * @default '#'
   */
  optionPrefix?: string
  /**
   * 文件夹标识文件名称
   * 
   * @default 'bmf.txt'
   */
  folderFileName?: string
}

/**
 * 扫描配置默认值
 */
export const DEFINE_SCAN_SCRIPT_OPTIONS: Required<ScanScriptOptions> = {
  root: 'src',
  extensions: ['.mjs', '.js', '.mts', '.ts', '.tsx', '.jsx'],
  optionPrefix: '#',
  folderFileName: 'bmf.txt'
};

/**
 * 扫描文件夹获取书签树
 * @param options 扫描配置
 * @returns 书签树
 */
export function scanScript(options: ScanScriptOptions): BookmarkExt[] {
  console.log(chalk.yellow(`Scan: ${options.root}`));
  const op: Required<ScanScriptOptions> = Object.assign(DEFINE_SCAN_SCRIPT_OPTIONS, options);
  return loopScan(nodePath.resolve(op.root), op);
}
