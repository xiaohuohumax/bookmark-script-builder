import axios from "axios";
import FileSaver from "file-saver";
import JSZip from "jszip";
import pLimit from "p-limit";

/**
 * 压缩包文件
 */
export class DFile {
    /**
    * @param {string} name 文件名称
    * @param {Blob} data 文件数据
    */
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
}

/**
 * 文件下载任务基类
 */
export class DTask {
    /**@type {DFile[]} */
    #file = [];
    /**
     * 执行下载任务并返回需要保存的文件
     * @returns 需要保存的文件集合
     */
    async start() {
        await this.run();
        return this.#file;
    }
    /**
     * 任务执行体, 自行实现下载过程
     */
    async run() {
        throw new Error("请继承此类, 自行重写 run 方法, 自行实现下载过程");
    }

    /**
     * 保存文件到压缩包中
     * @param {DFile} dFile 
     */
    saveFile(dFile) {
        this.#file.push(dFile);
    }
}

/**
 * 通用Blob下载任务, 下载图片等资源
 */
export class DBlobUrlTask extends DTask {
    /**
     * @param {string} url 文件地址
     * @param {string} method 下载方式 POST, GET, ...
     */
    constructor(url, method = "GET") {
        super();
        this.url = url;
        this.method = method;
    }

    /**
     * 下载并保存
     */
    async run() {
        // 下载图片
        const { data } = await axios({
            method: this.method,
            url: this.url,
            responseType: "blob"
        });
        const file = new DFile(this.url.split("/").pop(), data);

        // 保存文件
        this.saveFile(file);
    }
}

/**
 * 通过下载任务下载并打包文件
 * @param {DTask[]} dTask 下载任务
 * @param {string} fileName 保存文件名
 * @param {number} dLimit 下载任务同时执行上限
 */
export async function dlAndZipByTask(dTask = [], fileName = "download", dLimit = 10) {
    const limit = pLimit(dLimit);

    const zip = new JSZip();

    const tasks = dTask.map(task => limit(() => task.start()));
    // 异步执行下载任务
    (await Promise.all(tasks))
        .flat(1)
        .forEach(item => zip.file(item.name, item.data));
    // 打包文件
    FileSaver.saveAs(await zip.generateAsync({ type: "blob" }), fileName + ".zip");
}