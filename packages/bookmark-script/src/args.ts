import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { version } from '../package.json';

const cli = yargs(hideBin(process.argv));

cli.alias('v', 'version');
cli.alias('h', 'help');

cli.version(version);

cli.option('config', {
  type: 'string',
  description: '配置文件',
  alias: 'c'
}).option('mode', {
  type: 'string',
  description: '打包模式',
  default: '',
  alias: 'm'
});

/**
 * 命令行参数
 */
export interface Args {
  _: (string | number)[]
  $0: string

  /**
   * 配置文件路径
   */
  config?: string

  /**
   * 打包模式
   */
  mode: string
}

/**
 * 获取命令行参数
 * @returns 命令行参数
 */
export function loadArgs() {
  return <Args>(cli.argv as unknown);
}