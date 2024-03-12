import dotenv from 'dotenv';
import variables from 'dotenv-parse-variables';

import path from 'node:path';
import fs from 'node:fs';

/**
 * 环境变量
 */
export type Env = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any
}

function parserEnvFile(file: string): Env {
  if (!fs.existsSync(file)) {
    return {};
  }

  const config = dotenv.config({
    encoding: 'utf-8',
    override: true,
    path: file
  });

  return !config.error && config.parsed
    ? variables(config.parsed)
    : {};
}

/**
 * 加载环境变量
 * @param root 环境变量文件夹
 * @param mode 模式
 * @returns 环境变量
 */
export function loadEnvFile(root: string, mode: string): Env {
  const envPath = path.resolve(root);
  
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const envNames = [
    '.env',
    '.env.local',
  ];

  if (mode.trim() != '') {
    envNames.push(
      `.env.${mode}`,
      `.env.${mode}.local`
    );
  }

  const envs = envNames.map(e => parserEnvFile(path.resolve(envPath, e)));
  return envs.reduce((e1, e2) => Object.assign(e1, e2));
}