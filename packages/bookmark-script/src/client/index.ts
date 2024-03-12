import { Builder as BookmarkBuilder, RenderHTMLCallbackFuntion } from '@xiaohuohumax/bookmark';
import json from '@rollup/plugin-json';
import pLimit, { LimitFunction } from 'p-limit';
import ProgressBar from 'progress';

import {
  BookmarkScriptBuilder, BookmarkExt,
  BookmarkFolderExt, BookmarkLinkExt, isBookmarkFolder, isBookmarkLink
} from '../builder';
import { BuildScriptResWithError, buildScript } from '../rollup';
import { BookmarkScriptOptions, formatConfig } from './options';
import { loadArgs } from '../args';
import { Env, loadEnvFile } from '../env';
import { fileToBase64 } from '../util';

import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';
import chalk from 'chalk';

const DEFAULT_CONFIG_BASE = 'bm.config';

/**
 * 通过不同模式获取配置文件路径 mjs ts js
 * @param mode 模式
 * @returns 
 */
function findConfigFileNameInCwd(mode: string) {
  const filesInWorkingDirectory = new Set(fs.readdirSync(process.cwd()));
  for (const extension of ['mjs', 'ts']) {
    const fileName = `${DEFAULT_CONFIG_BASE}${mode ? '.' + mode : ''}.${extension}`;
    if (filesInWorkingDirectory.has(fileName))
      return fileName;
  }
  return `${DEFAULT_CONFIG_BASE}.js`;
}

/**
 * 打包配置文件加载配置信息
 * @param input 配置文件路径
 * @returns 配置信息
 */
async function loadOptionsFile(input: string): Promise<BookmarkScriptOptions> {
  const tmp = path.join(path.dirname(input), `bm.config.tmp.${Date.now()}.mjs`);
  try {
    const res = await buildScript({
      external: (id) => (id[0] !== '.' && !path.isAbsolute(id)),
      input,
      plugins: [json()],
      outputOptions: {
        format: 'esm',
        exports: 'named'
      }
    });

    if ('error' in res) {
      throw res.error;
    }
    fs.writeFileSync(tmp, res.code);
    const configFileUrl = url.pathToFileURL(tmp);
    return await (await import(configFileUrl.href)).default;
  } finally {
    fs.unlink(tmp, () => { });
  }
}

/**
 * 返回结果类型
 */
enum BuildBMLinkResKind {
  Console = 'Console',
  Bookmark = 'Bookmark'
}

/**
 * 打包成功返回
 */
interface BuildBMLinkBaseRes {
  code: string
  bml: BookmarkLinkExt
  kind: BuildBMLinkResKind
}

/**
 * 打包失败返回
 */
interface BuildBMLinkResWithError extends BuildScriptResWithError, Partial<BuildBMLinkBaseRes> {
  bml: BookmarkLinkExt
}

/**
 * 打包返回
 */
type BuildBMLinkRes = BuildBMLinkResWithError | BuildBMLinkBaseRes;

/**
 * Cli
 */
class Cli {
  private builder: BookmarkScriptBuilder;

  // 并发配置
  private limit: LimitFunction;
  private buildJobs: Promise<BuildBMLinkRes>[] = [];
  private buildJobsRes: BuildBMLinkRes[] = [];

  // 进度条
  private barMessage = `Building ${chalk.gray('[:bar]')} :rate/bps [:current/:total] :percent :etas`;
  private buildBar: ProgressBar = new ProgressBar(this.barMessage, {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: 0
  });

  constructor(private options: BookmarkScriptOptions, env: Env) {
    this.builder = new BookmarkScriptBuilder(options, env);
    this.limit = pLimit(Math.max(this.options.buildLimit, 1));
  }

  private clearup(options: BookmarkScriptOptions) {
    fs.rmSync(options.outDir, { recursive: true, force: true });
    fs.mkdirSync(options.outDir, { recursive: true });
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
   * 书签树过滤排除不打包的 isBuild: false
   * @param bms 书签树
   * @param parents 父路径
   * @returns 
   */
  private bmsFilter(bms: BookmarkExt[], parents: string[]): BookmarkExt[] {
    const res = [];
    for (const bm of bms) {
      const isFolder = isBookmarkFolder(bm);
      const fileEmoji = isFolder ? '📂' : '📄';

      const bml = <BookmarkLinkExt>bm;
      const bmf = <BookmarkFolderExt>bm;

      if (typeof (bm.isBuild) === 'boolean' && bm.isBuild == false) {
        console.log(
          chalk.redBright(fileEmoji + ' Ignore:'),
          chalk.gray('/' + parents.slice(1).join('/')),
          chalk.blue('=>'),
          chalk.gray(isFolder ? bm.name : bml.href)
        );

        continue;
      }
      if (isFolder) {
        res.push(bmf);
        bmf.children = this.bmsFilter((bmf).children, [...parents, bm.name]);
        continue;
      }
      if (!isBookmarkLink(bm)) {
        continue;
      }

      res.push(bml);

      if (bml.icon && fs.existsSync(bml.icon)) {
        bml.icon = fileToBase64(bml.icon);
      }

      // 文件夹名称
      let name = bml.name;
      bml.description && (name += `[${bml.description}]`);
      bml.version && (name += `(${bml.version})`);

      console.log(chalk.greenBright(fileEmoji + ' Find:'), chalk.gray(bm.name), chalk.blue('=>'), chalk.gray(bml.href));
    }
    return res;
  }

  /**
   * 将代码添加banner并写入文件
   * @param file 文件路径
   * @param code 代码
   * @param bml 书签信息
   */
  private saveBannerAndCodeToFile(file: string, code: string, bml: BookmarkLinkExt) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${this.bmlToBanner(bml)}\n${code}`, 'utf-8');
  }

  /**
   * 打包 控制台 版本并写入文件
   * @param bml 书签信息
   * @param folder 父路径
   * @returns 
   */
  private async buildConsoleScriptAndWrite(bml: BookmarkLinkExt, folder: string): Promise<BuildBMLinkRes> {
    try {
      const res = await this.builder.buildConsoleScript(bml);
      if ('error' in res) {
        return { ...res, bml };
      }
      const file = path.resolve(folder, 'console.js');
      this.saveBannerAndCodeToFile(file, res.code, bml);
      return { ...res, bml, kind: BuildBMLinkResKind.Console };
    } finally {
      this.buildBar.tick(1);
    }
  }

  /**
   * 打包 书签脚本 版本并写入文件
   * @param bml 书签信息
   * @param folder 父路径
   * @returns 
   */
  private async buildBookmarkScriptAndWrite(bml: BookmarkLinkExt, folder: string): Promise<BuildBMLinkRes> {
    try {
      const res = await this.builder.buildBookmarkScript(bml);
      if ('error' in res) {
        return { ...res, bml };
      }
      const file = path.resolve(folder, 'bookmark.txt');
      // HTML标签转换
      bml.href = res.code.replaceAll('&', () => '&amp;');
      this.saveBannerAndCodeToFile(file, res.code, bml);
      return { ...res, bml, kind: BuildBMLinkResKind.Bookmark };
    } finally {
      this.buildBar.tick(1);
    }
  }

  /**
   * 遍历书签树打包
   * @param bms 书签树
   * @param parents 输出路径
   */
  private async loopBuild(bms: BookmarkExt[], parents: string[]): Promise<void> {
    for (const bm of bms) {
      if (isBookmarkFolder(bm)) {
        await this.loopBuild((<BookmarkFolderExt>bm).children, [...parents, bm.name]);
        continue;
      }
      if (!isBookmarkLink(bm)) {
        continue;
      }
      const bml = <BookmarkLinkExt>bm;

      if (bml.icon && fs.existsSync(bml.icon)) {
        bml.icon = fileToBase64(bml.icon);
      }

      // 文件夹名称
      let name = bml.name;
      bml.description && (name += `[${bml.description}]`);
      bml.version && (name += `(${bml.version})`);
      const folder = path.resolve(...parents, name);

      this.buildJobs.push(this.limit((b, f) => this.buildConsoleScriptAndWrite(b, f), bml, folder));
      this.buildJobs.push(this.limit((b, f) => this.buildBookmarkScriptAndWrite(b, f), bml, folder));
    }
  }

  /**
   * 依据书签树构建书签HTML
   * @param bme 书签树
   * @returns 书签HTML
   */
  private buildHTML(bme: BookmarkExt[]): string {
    let callback: RenderHTMLCallbackFuntion | undefined = undefined;

    const { bmBuildOptions } = this.options;
    if (bmBuildOptions && bmBuildOptions.htmlTemple) {
      bmBuildOptions.htmlTemple.at(1);
      callback = ({ bookmark }) => bmBuildOptions.htmlTemple!.replaceAll('[[bookmark]]', () => bookmark + '\n');
    }

    const bookmarkBulder = new BookmarkBuilder(this.options.bmBuildOptions);
    const html = bookmarkBulder.buildHTMLString(bme, callback);
    const file = path.resolve(this.options.outDir, 'favorites.html');
    fs.writeFileSync(file, html, { encoding: 'utf-8' });
    return file;
  }

  /**
   * 打印打包结果
   */
  private printBuildStatInfo() {
    const infos = this.buildJobsRes.map(j => {
      return Object.assign({
        'name': j.bml.name,
        'type': j.kind
      }, ('error' in j)
        ? {
          'stat': 'Fail',
          'error': j.error.message
        } : {
          'stat': 'Success',
        });
    });
    console.table(infos, ['name', 'stat', 'type', 'error']);

    const isFail = this.buildJobsRes.find(j => {
      if ('error' in j) {
        console.error(j.error);
        return true;
      }
    });
    if (isFail) {
      console.log(chalk.redBright('\nBuild fail!!! 😢😢😢😢'));
    } else {
      console.log(chalk.greenBright('\nBuild success!!! 🎉🎉🎉🎉'));
    }
  }

  /**
   * 开始构建
   */
  async run() {
    this.clearup(this.options);

    console.log(chalk.yellow('[[Build script start]]'));
    const bms = this.bmsFilter(this.options.bms, [this.options.outDir]);
    await this.loopBuild(bms, [this.options.outDir]);
    console.log('');

    if (this.buildJobs.length > 0) {
      this.buildBar.total = this.buildJobs.length;
      this.buildBar.tick(0);
    }

    this.buildJobsRes = await Promise.all(this.buildJobs);
    console.log(chalk.yellow('\n[[Build HTML sctart]]'));

    const htmlFile = this.buildHTML(bms);
    console.log(chalk.green(htmlFile));

    console.log(chalk.yellow('\n[[Stat]]'));
    this.printBuildStatInfo();

  }

}

(async () => {
  // 命令行参数
  const { config, mode } = loadArgs();
  const configFile = config ?? findConfigFileNameInCwd(mode);

  if (!fs.existsSync(configFile)) {
    throw new Error('BM config not found!');
  }

  // 加载并解析配置文件
  const options = await formatConfig(await loadOptionsFile(path.resolve(configFile)));

  const env = loadEnvFile(options.env, mode);
  env.MODE = mode;

  // 打包构建
  const cli = new Cli(options, env);
  await cli.run();
})();