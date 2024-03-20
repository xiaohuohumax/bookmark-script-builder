/// <reference types="vite/client" />

/**
 * 书签信息虚拟模块
 */
declare module 'bookmark:meta' {
  const meta: import('./dist/builder').BookmarkLinkExt;
  export default meta;
}