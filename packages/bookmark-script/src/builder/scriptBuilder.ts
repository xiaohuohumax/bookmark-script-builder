import { BookmarkLinkExt } from './bookmarkExt';

/**
 * 打包结果
 */
export interface BuildScriptRes {
  /**
   * 打包代码
   */
  code: string
}

/**
 * 网络版注入脚本信息
 */
export interface InjectScript {
  /**
   * cdn地址
   */
  src: string
  /**
   * 脚本名称
   */
  name: string
  /**
   * 超时时间 秒
   */
  timeout: number
}

/**
 * 书签构建配置
 */
export interface ScriptBuilderOptions { }

/**
 * 书签打包器基类
 */
export class ScriptBuilder {

  constructor(protected options: ScriptBuilderOptions) { }

  /**
   * 打包控制台版脚本
   * @param bml 书签链接
   * @returns 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async buildConsoleScript(bml: BookmarkLinkExt): Promise<BuildScriptRes> {
    throw new Error('请重写此方法');
  }

  /**
   * 打包网络版脚本
   * @param inject 注入脚本信息
   * @returns 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async buildBookmarkNetworkScript(inject: InjectScript): Promise<BuildScriptRes> {
    throw new Error('请重写此方法');
  }

  /**
   * 打包书签版脚本
   * @param bml 书签链接
   * @returns 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async buildBookmarkScript(bml: BookmarkLinkExt): Promise<BuildScriptRes> {
    throw new Error('请重写此方法');
  }

}