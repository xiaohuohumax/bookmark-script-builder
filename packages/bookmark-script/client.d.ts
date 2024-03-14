interface ImportMetaEnv {
  MODE: string
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
}

declare module 'bookmark:meta' {
  const meta: import('./dist/builder').BookmarkLinkExt;
  export default meta;
}

declare module '@babel/preset-typescript' {
  const plugin: import('@babel/core').PluginItem;
  export default plugin;
}