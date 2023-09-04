// 元数据虚拟模块
declare module "virtual:meta" {
    const meta: {
        // 名称
        name: string,
        // 描述
        description: string,
        // 图标路径
        icon: string,
        // 版本号
        version: string,
        // 是否使用
        isuse: boolean,
    }
    export default meta
}