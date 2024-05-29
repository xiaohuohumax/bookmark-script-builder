import {
  Bookmark, Builder as BookmarkBuilder,
  BookmarkFolder, BookmarkLink, RenderHTMLCallbackFuntion
} from '@xiaohuohumax/bookmark';
import pLimit, { LimitFunction } from 'p-limit';
import ProgressBar from 'progress';
import chalk from 'chalk';

import {
  BookmarkExt, BookmarkFolderExt, BookmarkLinkExt,
  BookmarkScriptBuilder, ScriptBuilder, isBookmarkFolderExt
} from '../builder';
import { BookmarkScriptOptions } from './options';
import { fileToBase64, isUrl } from '../util';
import { scanScript } from './scan';

import path from 'node:path';
import fs from 'node:fs';

/**
 * 通过标签配置格式化名称
 * @param bml 标签
 * @returns 名称
 */
function bmlNameFormat(bml: BookmarkLinkExt): string {
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
 * 将代码添加banner并写入文件
 * @param file 文件路径
 * @param code 代码
 * @param bml 书签信息
 */
function saveBannerAndCodeToFile(file: string, code: string, banner: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${banner}\n${code}`, 'utf-8');
}

function getFormatIcon(bml: BookmarkLinkExt): string | void {
  const { icon, href } = bml;
  if (!icon) {
    return;
  }
  // 链接地址
  if (isUrl(icon)) {
    return icon;
  }
  // 本地文件地址
  const file = path.resolve(path.dirname(href), icon);
  if (fs.existsSync(file)) {
    return fileToBase64(file);
  }
  // 其他
  return icon;
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
  /**
   * 控制台版本
   */
  console: string
  /**
   * 书签版本
   */
  bookmark: string
  /**
   * 网络版本
   */
  bookmarkNetwork: string
}

/**
 * 打包任务结果
 */
interface JobRes {
  /**
   * 打包状态
   */
  status: JobResStatus
  /**
   * 异常信息
   */
  error?: Error
  /**
   * 打包代码
   */
  code: JobResCode
  /**
   * 耗时 毫秒
   */
  duration?: number
}

/**
 * 打包任务
 */
interface Job {
  /**
   * 书签链接信息
   */
  bml: BookmarkLinkExt
  /**
   * banner信息
   */
  banner: string
  /**
   * 书签父路径
   */
  parents: string[]
  /**
   * 打包结果
   */
  res: JobRes
}

/**
 * Cli
 */
export class Cli {

  // 书签脚本打包器
  private builder: ScriptBuilder;

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

  constructor(private options: BookmarkScriptOptions) {
    this.builder = new BookmarkScriptBuilder(options);
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
    // 1. 支持 书签全部信息
    const replaces: [string, string][] = Object.entries(bml)
      .map(([key, value]) => [key, value + '']);

    // 2. 扩展
    // [time] 打包时间
    replaces.push(['time', new Date().toLocaleString()]);
    // [mode] 打包模式名称
    replaces.push(['mode', this.options.mode ?? '']);

    return replaces.reduce(
      (banner, [key, value]) => banner.replaceAll(`[${key}]`, value),
      this.options.banner
    );
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
   * 扫描脚本
   */
  private scanScript() {
    if (Array.isArray(this.options.scans)) {
      for (const scan of this.options.scans) {
        this.options.bms.push(...scanScript(scan));
      }
    }
  }

  /**
   * 通过书签树创建打包任务
   */
  private async createJobs() {
    const loopBMS = async (bms: BookmarkExt[], parents: string[]) => {
      for (const bm of bms) {
        const bml = <BookmarkLinkExt>bm;
        const bmf = <BookmarkFolderExt>bm;
        const isFolder = isBookmarkFolderExt(bm);
        const fileEmoji = isFolder ? '📂' : '📄';

        if (typeof (bm.build) === 'boolean' && bm.build == false) {
          // 放弃打包
          console.log(
            chalk.yellowBright(fileEmoji + ' Ignore:'),
            chalk.gray(bm.name),
            chalk.blue('=>'),
            chalk.gray(isFolder ? '/' + parents.join('/') : bml.href)
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
          parents: [...parents, bmlNameFormat(bml)],
          res: {
            status: JobResStatus.Create,
            code: {
              console: '',
              bookmark: '',
              bookmarkNetwork: '',
            }
          }
        };

        console.log(
          chalk.greenBright(fileEmoji + ' Build:'),
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
    const startTime = performance.now();
    try {
      // 控制台版本
      const consolePath = path.join(...job.parents, 'console.js');
      const consoleRes = await this.builder.buildConsoleScript(job.bml);
      job.res.code.console = consoleRes.code;

      saveBannerAndCodeToFile(
        path.resolve(this.options.outDir, consolePath),
        consoleRes.code,
        job.banner
      );

      // 离线书签
      const bookmarkPath = path.join(...job.parents, 'bookmark.txt');
      const bookmarkRes = await this.builder.buildBookmarkScript(job.bml);
      job.res.code.bookmark = bookmarkRes.code;

      saveBannerAndCodeToFile(
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
          name: bmlNameFormat(job.bml),
          timeout: this.options.cdnTimeout
        });
        job.res.code.bookmarkNetwork = bookmarkNetworkRes.code;

        saveBannerAndCodeToFile(
          path.resolve(this.options.outDir, onlinePath),
          bookmarkNetworkRes.code,
          job.banner
        );
      }
      job.res.status = JobResStatus.BuildSuccess;
      job.res.duration = parseFloat((performance.now() - startTime).toFixed(2));
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
    this.bar.total = this.jobs.length;
    this.bar.tick(0);
    await Promise.all(this.jobs.map(job => this.limit((j) => this.buildJob(j), job)));
  }


  /**
   * 通过打包任务构建书签树
   * @param isNetwork 是否使用网络标签
   * @returns 书签树
   */
  private async buildBMSTree(isNetwork: boolean) {
    /**
     * 依据路径重建书签树
     * @param root 书签树
     * @param parents 书签路径
     * @param bml 书签
     */
    function createTree(root: Bookmark[], parents: string[], bml: BookmarkLink) {
      for (const parent of parents) {
        const item = root.find(c => c.name == parent && isBookmarkFolderExt(c));
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
        const b: BookmarkLink = {
          name: bml.name,
          // 判断使用哪种版本
          href: isNetwork ? code.bookmarkNetwork : code.bookmark
        };
        // 设置icon
        const icon = getFormatIcon(bml);
        icon && (b.icon = icon);

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
      return bmBuildOptions.htmlTemple.replaceAll('[[bookmark]]', () => bookmark + '\n');
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
      'duration(ms)'?: number
    }
    // 异常
    let e: Error | undefined;

    // 统计信息
    const infos: Info[] = this.jobs.map(({ bml: { name }, res }) => {
      const r: Info = {
        name,
        stat: 'Success',
      };
      res.duration && (r['duration(ms)'] = res.duration);
      if (res.status == JobResStatus.BuildFail && res.error) {
        r.error = res.error.message;
        r.stat = 'Fail';
        e = res.error;
      }
      return r;
    });
    console.table(infos, ['name', 'stat', 'duration(ms)', 'error']);

    if (e) {
      // 打印第一个异常信息
      console.error(e);
      console.log(chalk.redBright('\nBuild fail !!! 😢😢😢😢'));
    } else {
      console.log(chalk.greenBright('\nBuild success !!! 🎉🎉🎉🎉'));
    }
  }

  /**
   * 开始构建
   */
  async run() {
    // 清理
    this.clearup();

    // 扫描脚本
    console.log(chalk.yellow('[[Scan script]]'));
    this.scanScript();

    // 创建任务
    console.log(chalk.yellow('\n[[Build jobs]]'));
    await this.createJobs();

    if (this.jobs.length == 0) {
      console.log(chalk.yellowBright('\nNothing to do ~~~ 😑😑😑😑'));
      return;
    }

    // 执行任务
    console.log(chalk.yellow('\n[[Building]]'));
    await this.buildJobs();

    // 构建书签
    console.log(chalk.yellow('\n[[Build HTML]]'));
    await this.buildHTML();

    // 打印结果
    console.log(chalk.yellow('\n[[Stat]]'));
    this.printBuildStatInfo();
  }
}