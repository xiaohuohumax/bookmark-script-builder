import path from "path";
import { fileURLToPath } from "url";

import fs from "fs-extra";
import mime from "mime-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 默认图标路径
const defaultIconPath = path.resolve(__dirname, "icon.png");
// 默认书签导入模板
const defaultHtmlPath = path.resolve(__dirname, "favorites.html");

/**
 * 将文件读取为 Base64 格式字符串
 * @param {string} filePath 文件路径
 * @returns Base64 格式字符串
 */
function fileToBase64(filePath) {
    if (!fs.existsSync(filePath)) {
        filePath = defaultIconPath;
    }
    const base64 = Buffer.from(fs.readFileSync(filePath)).toString("base64");
    return `data:${mime.lookup(filePath)};base64,${base64}`;
}

/**
 * 书签树通用
 */
export class FavoritesBase {
    constructor({ context = "" }) {
        // 创建事件
        this.createTime = new Date();
        // 节点添加时间
        this.addDate = this.createTime.getTime();
        // 节点内容
        this.context = context;
    }
    loadLines() {
        return [];
    }
}

/**
 * 书签树-文件夹节点
 */
export class FavoritesDir extends FavoritesBase {
    constructor({ context = "", ptf = false, childs = [] }) {
        super({ context });
        // 最后修改时间
        this.lastModified = this.createTime.getTime();
        this.ptf = ptf;
        /**@type {FavoritesBase[]} */
        this.childs = childs;
    }
    loadLines() {
        const ptf = this.ptf ? " PERSONAL_TOOLBAR_FOLDER=\"true\"" : "";
        const childLines = this.childs
            .map(item => item.loadLines())
            .flat(Infinity)
            .map(item => `\t${item}`);

        return [
            `<DT><H3 ADD_DATE="${this.addDate}" LAST_MODIFIED="${this.lastModified}"${ptf}>${this.context}</H3>`,
            "<DL><p>",
            ...childLines,
            "</DL><p>",
        ];
    }
}

/**
 * 书签树-书签节点
 */
export class FavoritesTag extends FavoritesBase {
    constructor({ context = "", href = "", icon = "", isUse = true }) {
        super({ context });
        this.href = href;
        this.isUse = isUse;
        this.icon = icon;
    }
    loadLines() {
        if (!this.isUse) {
            return [];
        }

        return [
            `<DT><A HREF="${this.href}" ADD_DATE="${this.addDate}" ICON="${fileToBase64(this.icon)}">${this.context}</A>`,
        ];
    }
}

/**
 * 书签树-根
 */
export class FavoritesRoot {
    constructor({ childs = [], title = "", name = "", icon = "", mode = "", time = "", pname = "", version = "", author = "" }) {
        this.title = title;
        this.icon = icon;
        this.name = name;
        this.mode = mode;
        this.time = time;
        this.pname = pname;
        this.version = version;
        this.author = author;
        /**@type {FavoritesBase[]} */
        this.childs = childs;
    }
    /**
     * 生成书签导入文件 Html
     * @returns 书签导入文件 Html
     */
    createHtml() {
        const tmp = fs.readFileSync(defaultHtmlPath, { encoding: "utf-8" });
        const bookmark = [
            "<DL><p>",
            ...this.childs
                .map(item => item.loadLines())
                .flat(Infinity)
                .map(item => "\t" + item),
            "</DL><p>"
        ].join("\n");

        const icon = fileToBase64(this.icon);

        return tmp
            .replace("[{time}]", () => this.time)
            .replace("[{author}]", () => this.author)
            .replace("[{pname}]", () => this.pname)
            .replace("[{version}]", () => this.version)
            .replace("[{name}]", () => this.name)
            .replace("[{mode}]", () => this.mode)
            .replaceAll("[{icon}]", () => icon)
            .replace("[{bookmark}]", () => bookmark)
            .replace("[{title}]", () => this.title);
    }
}
