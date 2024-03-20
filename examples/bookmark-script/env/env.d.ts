interface ImportMetaEnv {
  BM_APP_NAME: string
  // 其他参数自行添加
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
}