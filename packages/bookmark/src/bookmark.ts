/**
 * 链接节点
 */
export interface BookmarkLink {
  /**
   * 名称
   */
  name: string
  /**
   * 书签地址
   */
  href: string
  /**
   * 书签图标 base64 格式
   */
  icon?: string
}

/**
 * 文件夹节点
 */
export interface BookmarkFolder<C = Bookmark> {
  /**
   * 文件夹名称
   */
  name: string
  /**
   * 子项目
   */
  children: C[]
}

/**
 * 是否是文件夹节点
 * @param bm 书签
 * @returns 
 */
export function isBookmarkFolder(bm: Bookmark): boolean {
  return 'children' in bm && Array.isArray(bm.children);
}

/**
 * 是否是链接节点
 * @param bm 书签
 * @returns 
 */
export function isBookmarkLink(bm: Bookmark): boolean {
  return 'href' in bm;
}

/**
 * 书签节点
 */
export type Bookmark = BookmarkFolder | BookmarkLink