import fs from 'node:fs';
import path from 'node:path';

/**
 * 按文件原内容导入
 * @returns {import('rollup').Plugin}
 */
export default function raw() {
  const rawIdPrefix = '\0rollup-plugin-raw';
  return {
    name: 'rollup-plugin-raw',
    resolveId(id, importer) {
      if (/\?raw/.test(id)) {
        return rawIdPrefix + path.resolve(path.dirname(importer), id);
      }
    },
    load(id) {
      if (id.startsWith(rawIdPrefix) && /\?raw$/.test(id)) {
        const file = id.slice(rawIdPrefix.length, -4);
        return `export default ${JSON.stringify(fs.readFileSync(file, 'utf-8'))}`;
      }
    }
  };
}