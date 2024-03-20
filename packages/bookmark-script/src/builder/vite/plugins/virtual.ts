import { Plugin } from 'vite';

/**
 * 向打包代码注入虚拟模块
 * @param name 模块名称
 * @param data 模块数据
 * @returns
 */
export default function virtual<T>(name: string, data: T): Plugin {
  const rId = '\0' + name;
  return {
    name: 'vite-plugin-virtual-' + name.replaceAll(':', () => '-'),
    resolveId(id) {
      if (id === name) {
        return rId;
      }
    },
    load(id) {
      if (id === rId) {
        return `export default ${JSON.stringify(data)};`;
      }
    }
  };
}