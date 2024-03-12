interface ImportMetaEnv {
  MODE: string
  APP_NAME: string
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
}