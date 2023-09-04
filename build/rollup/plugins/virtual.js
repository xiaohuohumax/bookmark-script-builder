/**
 * 虚拟模块插件
 * @param {any} meta 元数据
 * @returns rollup 元数据虚拟模块插件
 */
export function virtualPlugin(meta = {}) {
    const vMtetaId = "virtual:meta";
    const rVMetaId = "\0" + vMtetaId;
    return {
        name: "virtual-plugin",
        resolveId(id) {
            if (id === vMtetaId) {
                return rVMetaId;
            }
        },
        load(id) {
            if (id === rVMetaId) {
                return `export default ${JSON.stringify(meta)};`;
            }
        }
    };
}