// 环境变量限制
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  // 打包环境 其他模式自行扩展
  readonly MODE: 'dev' | 'prod' | undefined;
  // 日志等级
  readonly LOGGING_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error';
}

// import.meta.env.[...]
interface ImportMeta {
  readonly env: ImportMetaEnv
}
