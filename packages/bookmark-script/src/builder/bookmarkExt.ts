import {
  BookmarkLink, BookmarkFolder,
  isBookmarkFolder as isFolder, isBookmarkLink as isLink
} from '@xiaohuohumax/bookmark';

/**
 * 书签链接
 */
export interface BookmarkLinkExt extends BookmarkLink {
  /**
   * 是否构建
   */
  build?: boolean
  /**
   * 版本
   */
  version?: string
  /**
   * 书签描述
   */
  description?: string
  /**
   * 控制台版本代码是否压缩
   * 
   * 未配置, 则以全局 `minify` 为准
   */
  minify?: boolean
}

/**
 * 书签文件夹
 */
export interface BookmarkFolderExt<C = BookmarkExt> extends BookmarkFolder<C> {
  /**
   * 是否构建
   */
  build?: boolean
  /**
   * 书签描述
   */
  description?: string
}

/**
 * 书签
 */
export type BookmarkExt = BookmarkFolderExt | BookmarkLinkExt

/**
 * 是否是文件夹节点
 * @param bm 书签
 * @returns
 */
export function isBookmarkFolderExt(bme: BookmarkExt): boolean {
  return isFolder(bme);
}

/**
 * 是否是书签节点
 * @param bm 书签
 * @returns
 */
export function isBookmarkLinkExt(bme: BookmarkExt): boolean {
  return isLink(bme) || 'version' in bme;
}