import { build as viteBuild } from '../builder/vite/build';
import { BookmarkScriptOptions, formatConfig } from './options';
import { loadArgs } from '../args';
import { Cli } from './cli';

import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const DEFAULT_CONFIG_BASE = 'bm.config';

/**
 * 通过不同模式获取配置文件路径 mjs ts js mts
 * @returns 配置文件路径
 */
function findConfigFileNameInCwd(): string {
  const filesInWorkingDirectory = new Set(fs.readdirSync(process.cwd()));
  for (const extension of ['mjs', 'ts', 'mts']) {
    const fileName = `${DEFAULT_CONFIG_BASE}.${extension}`;
    if (filesInWorkingDirectory.has(fileName))
      return fileName;
  }
  return `${DEFAULT_CONFIG_BASE}.js`;
}

/**
 * 打包各种格式配置文件获取配置信息
 * @param input 配置文件路径
 * @returns 配置信息
 */
async function loadOptionsFile(input: string): Promise<BookmarkScriptOptions> {
  // 临时配置文件
  const tmp = path.join(path.dirname(input), `bm.config.tmp.${Date.now()}.mjs`);
  try {
    const res = await viteBuild({
      external: (id) => (id[0] !== '.' && !path.isAbsolute(id)),
      input,
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

(async () => {
  // 命令行参数
  const { config, mode } = loadArgs();
  const configFile = config ?? findConfigFileNameInCwd();

  if (!fs.existsSync(configFile)) {
    // 配置文件不存在
    throw new Error('BM config not found!');
  }

  // 加载并解析配置文件
  const options = await formatConfig(await loadOptionsFile(path.resolve(configFile)));

  options.mode = mode;

  // 打包构建
  const cli = new Cli(options);
  await cli.run();
})();