import { Bookmark, BookmarkFolder, BookmarkLink, isBookmarkFolder, isBookmarkLink } from './bookmark';
import defineTempleHTML from './index.html?raw';

/**
 * 打包器配置信息
 */
export interface BuildOptions {
  /**
   * 是否添加到 个人工具栏文件夹
   */
  personalToolbarFolder?: boolean
}

/**
 * 书签打包器默认配置
 */
export const DEFINE_BUILD_OPTIONS: Required<BuildOptions> = {
  personalToolbarFolder: true
};

export interface RenderHTMLCallbackOptions {
  bookmark: string
}

/**
 * 渲染内容回调
 */
export type RenderHTMLCallbackFuntion = (options: RenderHTMLCallbackOptions) => string | void;

/**
 * 书签打包器
 */
export class Builder {
  private options: Required<BuildOptions> = DEFINE_BUILD_OPTIONS;

  constructor(options?: BuildOptions) {
    this.options = Object.assign(this.options, options);
  }

  /**
   * 转换书签树至HTML格式
   * @param bms 书签树
   * @returns 书签转HTML行
   */
  private buildBookmark(bms: Bookmark[], level: number = 0): string[] {
    const lines: string[] = [];
    for (const bm of bms) {
      if (isBookmarkFolder(bm)) {
        const ptf = this.options.personalToolbarFolder && level == 0 ? ' PERSONAL_TOOLBAR_FOLDER="true"' : '';
        lines.push(
          `<DT><H3${ptf}>${bm.name}</H3>`,
          '<DL><p>',
          ...this.buildBookmark((<BookmarkFolder>bm).children, ++level),
          '</DL><p>',
        );
      } else if (isBookmarkLink(bm)) {
        const { icon = '', href, name } = <BookmarkLink>bm;
        lines.push(
          `<DT><A HREF="${href}" ICON="${icon}">${name}</A>`,
        );
      }
    }
    return lines.map(l => l.padStart(l.length + 4, ' '));
  }

  /**
   * 构建 书签树到 HTML
   * @param bms 书签树
   * @param renderHTMLCallback 渲染回调 用户自行设置模板
   * @returns 
   */
  public buildHTMLString(bms: Bookmark[], renderHTMLCallback?: RenderHTMLCallbackFuntion): string {
    if (this.options.personalToolbarFolder) {
      bms = [{
        name: '',
        children: bms
      }];
    }
    const bookmarkLines = [
      '<DL><p>',
      ...this.buildBookmark(bms),
      '</DL><p>'
    ];
    const bookmark = bookmarkLines.join('\n');

    if (renderHTMLCallback && typeof (renderHTMLCallback) === 'function') {
      const res = renderHTMLCallback({ bookmark });
      if (res) {
        return res;
      }
    }
    return defineTempleHTML.replaceAll('[[bookmark]]', () => bookmark);
  }
}
