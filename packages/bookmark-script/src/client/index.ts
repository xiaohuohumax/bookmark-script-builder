import {
  Bookmark, Builder as BookmarkBuilder,
  BookmarkFolder, RenderHTMLCallbackFuntion
} from '@xiaohuohumax/bookmark';
import json from '@rollup/plugin-json';
import pLimit, { LimitFunction } from 'p-limit';
import ProgressBar from 'progress';

import {
  BookmarkScriptBuilder, BookmarkExt,
  BookmarkFolderExt, BookmarkLinkExt, isBookmarkFolder
} from '../builder';
import { buildScript } from '../rollup';
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
  // 临时配置文件
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

    fs.writeFileSync(tmp, res.code);
    const configFileUrl = url.pathToFileURL(tmp);
    return await (await import(configFileUrl.href)).default;
  } finally {
    fs.unlink(tmp, () => { });
  }
}
/**
 * 打包任务状态值
 */
enum JobResStatus {
  Create = 'Create',
  BuildFail = 'BuildFail',
  BuildSuccess = 'BuildSuccess'
}

/**
 * 打包各个版本代码
 */
interface JobResCode {
  console: string
  bookmark: string
  bookmarkNetwork: string
}

/**
 * 打包任务结果
 */
interface JobRes {
  status: JobResStatus
  error?: Error
  code: JobResCode
}

/**
 * 打包任务
 */
interface Job {
  bml: BookmarkLinkExt
  banner: string
  parents: string[]
  res: JobRes
}

/**
 * Cli
 */
class Cli {
  private builder: BookmarkScriptBuilder;

  // 并发配置
  private limit: LimitFunction;
  private jobs: Job[] = [];

  // 进度条
  private barMessage = `Building ${chalk.gray('[:bar]')} :rate/bps [:current/:total] :percent :etas`;
  private bar: ProgressBar = new ProgressBar(this.barMessage, {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: 0
  });

  constructor(private options: BookmarkScriptOptions, env: Env) {
    this.builder = new BookmarkScriptBuilder(options, env);
    this.limit = pLimit(Math.max(this.options.buildLimit, 1));
  }

  /**
   * 清除历史构建数据
   */
  private clearup() {
    fs.rmSync(this.options.outDir, { recursive: true, force: true });
    fs.mkdirSync(this.options.outDir, { recursive: true });
  }

  /**
   * 依据书签信息替换banner的信息
   * @param bml 书签信息
   * @returns 书签banner
   */
  private bmlToBanner(bml: BookmarkLinkExt): string {
    if (!this.options.banner) {
      return '';
    }
    let banner: string = this.options.banner;
    for (const [key, value] of Object.entries(bml)) {
      banner = banner.replace(`[${key}]`, () => value);
    }

    return banner.replaceAll(/\[\w+\]/ig, () => '');
  }

  /**
   * 将代码添加banner并写入文件
   * @param file 文件路径
   * @param code 代码
   * @param bml 书签信息
   */
  private saveBannerAndCodeToFile(file: string, code: string, banner: string) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${banner}\n${code}`, 'utf-8');
  }

  /**
   * 通过标签配置格式化名称
   * @param bml 标签
   * @returns 名称
   */
  private bmlNameFormat(bml: BookmarkLinkExt): string {
    let name = bml.name;
    if (bml.description && bml.description != '') {
      name += `[${bml.description}]`;
    }
    if (bml.version && bml.version != '') {
      name += `(${bml.version})`;
    }
    return name;
  }

  /**
   * 是否使用了CDN
   * @returns 
   */
  private isUseCdn(): boolean {
    const { cdn } = this.options;
    return typeof (cdn) === 'string' && cdn.trim() != '';
  }

  /**
   * 通过书签树创建打包任务
   */
  private async createJobs() {
    const loopBMS = async (bms: BookmarkExt[], parents: string[]) => {
      for (const bm of bms) {
        const bml = <BookmarkLinkExt>bm;
        const bmf = <BookmarkFolderExt>bm;
        const isFolder = isBookmarkFolder(bm);
        const fileEmoji = isFolder ? '📂' : '📄';

        if (typeof (bm.isBuild) === 'boolean' && bm.isBuild == false) {
          // 放弃打包
          console.log(
            chalk.yellowBright(fileEmoji + ' Ignore:'),
            chalk.gray(bm.name),
            chalk.blue('=>'),
            chalk.gray(bml.href)
          );
          continue;
        }

        if (isFolder) {
          await loopBMS(bmf.children, [...parents, bmf.name]);
          continue;
        }
        // 初始打包任务
        const job: Job = {
          bml,
          banner: this.bmlToBanner(bml),
          parents: [...parents, this.bmlNameFormat(bml)],
          res: {
            status: JobResStatus.Create,
            code: {
              console: '',
              bookmark: '',
              bookmarkNetwork: ''
            }
          }
        };

        console.log(
          chalk.greenBright(fileEmoji + ' Find:'),
          chalk.gray(bm.name),
          chalk.blue('=>'),
          chalk.gray(bml.href)
        );
        this.jobs.push(job);
      }
    };

    await loopBMS(this.options.bms, []);
  }

  /**
   * 通过打包任务构建各个版本书签
   * @param job 打包任务
   */
  private async buildJob(job: Job) {
    try {
      // 控制台版本
      const consolePath = path.join(...job.parents, 'console.js');
      const consoleRes = await this.builder.buildConsoleScript(job.bml);
      job.res.code.console = consoleRes.code;

      this.saveBannerAndCodeToFile(
        path.resolve(this.options.outDir, consolePath),
        consoleRes.code,
        job.banner
      );

      // 离线书签
      const bookmarkPath = path.join(...job.parents, 'bookmark.txt');
      const bookmarkRes = await this.builder.buildBookmarkScript(job.bml);
      job.res.code.bookmark = bookmarkRes.code;

      this.saveBannerAndCodeToFile(
        path.resolve(this.options.outDir, bookmarkPath),
        bookmarkRes.code,
        job.banner
      );

      if (this.isUseCdn()) {
        // 网络版书签
        const onlinePath = path.join(...job.parents, 'bookmark-network.txt');

        const cdn = this.options.cdn!;

        const bookmarkNetworkRes = await this.builder.buildBookmarkNetworkScript({
          src: new URL(consolePath, cdn.endsWith('/') ? cdn : cdn + '/').href,
          name: this.bmlNameFormat(job.bml)
        });
        job.res.code.bookmarkNetwork = bookmarkNetworkRes.code;

        this.saveBannerAndCodeToFile(
          path.resolve(this.options.outDir, onlinePath),
          bookmarkNetworkRes.code,
          job.banner
        );
      }
      job.res.status = JobResStatus.BuildSuccess;
    } catch (error) {
      job.res.status = JobResStatus.BuildFail;
      job.res.error = <Error>error;
    } finally {
      this.bar.tick(1);
    }
  }

  /**
   * 执行打包任务
   */
  private async buildJobs() {
    if (this.jobs.length == 0) {
      return;
    }
    this.bar.total = this.jobs.length;
    this.bar.tick(0);
    await Promise.all(this.jobs.map(job => this.limit((j) => this.buildJob(j), job)));
  }

  /**
   * 通过打包任务构建书签树
   * @param isNetwork 是否使用网络标签
   * @returns 
   */
  private async buildBMSTree(isNetwork: boolean) {
    /**
     * 依据路径重建书签树
     * @param root 书签树
     * @param parents 书签路径
     * @param bml 书签
     */
    function createTree(root: Bookmark[], parents: string[], bml: BookmarkLinkExt) {
      for (const parent of parents) {
        const item = root.find(c => c.name == parent && isBookmarkFolder(c));
        if (!item) {
          const folder: BookmarkFolder = {
            name: parent,
            children: []
          };
          root.push(folder);
          root = folder.children;
        } else {
          root = (<BookmarkFolder>item).children;
        }
      }
      root.push(bml);
    }

    // 书签树
    const bms: Bookmark[] = [];

    this.jobs
      .filter(j => j.res.status == JobResStatus.BuildSuccess)
      .forEach(({ parents, bml, res: { code } }) => {
        const b: Bookmark = {
          name: bml.name,
          // 判断使用哪种版本
          href: isNetwork ? code.bookmarkNetwork : code.bookmark
        };
        if (bml.icon && fs.existsSync(bml.icon)) {
          b.icon = fileToBase64(bml.icon);
        }
        createTree(bms, parents, b);
      });

    return bms;
  }

  /**
   * 依据书签树构建书签HTML
   */
  private async buildHTML() {
    // 书签HTML构建回调
    const callback: RenderHTMLCallbackFuntion = ({ bookmark }) => {
      const { bmBuildOptions } = this.options;
      if (!bmBuildOptions || !bmBuildOptions.htmlTemple) {
        return;
      }
      // 通过配置中模板替换
      bmBuildOptions.htmlTemple.replaceAll('[[bookmark]]', () => bookmark + '\n');
    };

    // 离线版
    const bookmarkBulder = new BookmarkBuilder(this.options.bmBuildOptions);
    const file = path.resolve(this.options.outDir, 'favorites.html');
    fs.writeFileSync(
      file,
      bookmarkBulder.buildHTMLString(await this.buildBMSTree(false), callback),
      { encoding: 'utf-8' }
    );

    console.log(chalk.greenBright(file));

    if (this.isUseCdn()) {
      // 网络版
      const networkFile = path.resolve(this.options.outDir, 'favorites-network.html');
      fs.writeFileSync(
        networkFile,
        bookmarkBulder.buildHTMLString(await this.buildBMSTree(true), callback),
        { encoding: 'utf-8' }
      );
      console.log(chalk.greenBright(networkFile));
    }
  }

  /**
   * 打印打包结果
   */
  private printBuildStatInfo() {
    interface Info {
      name: string
      stat: string
      error?: string
    }
    // 异常
    let e: Error | undefined;

    // 统计信息
    const infos: Info[] = this.jobs.map(({ bml: { name }, res }) => {
      const r: Info = {
        name,
        stat: 'Success',
      };
      if (res.status == JobResStatus.BuildFail && res.error) {
        r['error'] = res.error.message;
        r['stat'] = 'Fail';
        e = res.error;
      }
      return r;
    });
    console.table(infos, ['name', 'stat', 'error']);

    if (e) {
      // 打印第一个异常信息
      console.error(e);
      console.log(chalk.redBright('\nBuild fail!!! 😢😢😢😢'));
    } else {
      console.log(chalk.greenBright('\nBuild success!!! 🎉🎉🎉🎉'));
    }
  }

  /**
   * 开始构建
   */
  async run() {
    // 清理
    this.clearup();

    // 创建任务
    console.log(chalk.yellow('[[Build script start]]'));
    await this.createJobs();

    // 执行任务
    console.log(chalk.yellow('\n[[Building]]'));
    await this.buildJobs();

    // 构建书签
    console.log(chalk.yellow('\n[[Build HTML start]]'));
    await this.buildHTML();

    // 打印结果
    console.log(chalk.yellow('\n[[Stat]]'));
    this.printBuildStatInfo();
  }
}

(async () => {
  // 命令行参数
  const { config, mode } = loadArgs();
  const configFile = config ?? findConfigFileNameInCwd(mode);

  if (!fs.existsSync(configFile)) {
    // 配置文件不存在
    throw new Error('BM config not found!');
  }

  // 加载并解析配置文件
  const options = await formatConfig(await loadOptionsFile(path.resolve(configFile)));

  // 加载环境变量
  const env = loadEnvFile(options.env, mode);
  env.MODE = mode;

  // 打包构建
  const cli = new Cli(options, env);
  await cli.run();
})();