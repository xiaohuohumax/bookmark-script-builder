import path from "path";

import chalk from "chalk";
import fs from "fs-extra";
import pLimit from "p-limit";

import { loadArgs } from "./args.js";
import * as fa from "./bookmark/index.js";
import { loadEnv } from "./env.js";
import lg from "./lg.js";
import * as meta from "./meta.js";
import { buildIIFE } from "./rollup/index.js";
import * as tools from "./tools.js";

/**
 * 默认配置参数
 */
export const dOptions = {
    // 打包输出路径
    outDir: "dist",
    // 脚本根目录
    scriptRoot: "src/script",
    // 收藏夹导入文件名称
    favoritesFileName: "favorites.html",
    // 缓存文件夹名称
    tmpName: "tmp",
    // 脚本支持打包格式
    scriptExts: [".js", ".mjs"],
    // 文件夹配置文件名称
    favoritesMetaName: ".favorites",
    // 环境变量根目录
    envRoot: "env",
    // 同时打包数量
    jobLimitMax: 10
};

/**
 * 打包结果类
 */
class BuildJobRes {
    constructor(error, scriptPath, isUse) {
        this.error = error;
        this.scriptPath = scriptPath;
        this.isUse = isUse;
    }
}

/**
 * 书签脚本 Builder
 */
export class BookmarkScriptBuilder {
    #options;
    #env;
    #args;
    #childs = [];
    #jobLimit;
    #buildJobs = [];

    constructor(options = dOptions) {
        this.#options = options;
        this.#args = loadArgs();
        this.#env = loadEnv(this.#options.envRoot, this.#args.mode);
        this.#jobLimit = pLimit(this.#options.jobLimitMax);
    }

    /**
     * 初始化 Builder
     * @param {dOptions} options 打包配置
     * @returns 书签脚本 Builder
     */
    static init(options = dOptions) {
        return new BookmarkScriptBuilder(options);
    }

    /**
     * 标签脚本打包执行
     * @param {fa.FavoritesTag} favoritesTag 标签
     * @param {string} scriptPath 脚本入口文件路径
     * @param {number} index 任务下标序号
     * @returns 打包结果
     */
    async #buildJobActuator(favoritesTag, scriptPath, index) {
        const res = new BuildJobRes(null, scriptPath, false);
        try {
            const fileMeta = meta.loadScriptMeta(scriptPath);

            lg.info(chalk.green((fileMeta.isuse ? "📄" : "🚮") + `[${index}/${this.#buildJobs.length}] ` + scriptPath));
            lg.debug(chalk.gray(" ↪" + chalk.cyan("[meta] ") + JSON.stringify(fileMeta)));

            favoritesTag.isUse = fileMeta.isuse;
            res.isUse = fileMeta.isuse;
            if (!fileMeta.isuse) {
                // 放弃加载此脚本
                return res;
            }
            const metaInfo = meta.createCommentsByMeta({
                "名称": fileMeta.name,
                "描述": fileMeta.description,
                "版本": fileMeta.version,
            });
            const outPath = path.parse(path.resolve(this.#options.outDir, scriptPath.replace(path.join(this.#options.scriptRoot), "."))).dir;

            const cOutPath = path.join(outPath, "console.js");
            const bOutPath = path.join(outPath, "bookmark.txt");

            lg.debug(chalk.gray(" ↪" + chalk.cyan("[console] ") + cOutPath));
            lg.debug(chalk.gray(" ↪" + chalk.cyan("[bookmark] ") + bOutPath));

            // 控制台版本 [未压缩/未混淆]
            const tmpPath = path.join(this.#options.outDir, this.#options.tmpName, tools.randomUUID());
            await buildIIFE(scriptPath, tmpPath, false, fileMeta, this.#env);

            tools.writeFileSync(cOutPath, `${metaInfo}\n\n${tools.readFileSync(tmpPath)}`);

            // 浏览器标签版本 [压缩/混淆]
            await buildIIFE(scriptPath, tmpPath, true, fileMeta, this.#env);

            // HTML转义修改 & => &amp;
            const favoritesScript = tools.readFileSync(tmpPath).replaceAll("&", () => "&amp;");
            const bmContext = `javascript: ${encodeURI(favoritesScript)}void(0);`;
            tools.writeFileSync(bOutPath, `${metaInfo}\n\n${bmContext}`);

            // 修改书签树数据
            favoritesTag.icon = fileMeta.icon;
            favoritesTag.href = bmContext;
            favoritesTag.context = fileMeta.name + (fileMeta.description && `[${fileMeta.description}]`) + (fileMeta.version && `(${fileMeta.version})`);
        } catch (error) {
            res.error = error;
        }
        return res;
    }

    /**
     * 递归扫描文件脚本路径构建书签树
     * @param {string} dirPath 当前文件夹路径
     * @param {number} level 递归层级
     * @returns 书签子树
     */
    #createBMSBuildJob(dirPath, level = 0) {
        const spaces = " ".repeat(level * 2);

        dirPath = path.join(dirPath);
        let childs = [];

        if (!fs.existsSync(dirPath)) {
            return childs;
        }

        const dirMeta = meta.loadFileMeta(path.join(dirPath, this.#options.favoritesMetaName));

        lg.info(chalk.green(spaces + (dirMeta.isuse ? "📁" : "🚮") + dirPath));
        lg.debug(chalk.gray(spaces + " ↪" + chalk.cyan("[meta] ") + JSON.stringify(dirMeta)));

        if (!dirMeta.isuse) {
            // 放弃加载此文件夹下所有脚本
            return childs;
        }

        const files = fs.readdirSync(dirPath, { withFileTypes: true })
            .map(file => {
                file.absPath = path.join(dirPath, file.name);
                file.ext = path.parse(file.absPath).ext;
                return file;
            });

        for (const file of files.filter(file => file.isFile() && this.#options.scriptExts.includes(file.ext))) {
            const tag = new fa.FavoritesTag({});
            this.#buildJobs.push(this.#jobLimit((index) => this.#buildJobActuator(tag, file.absPath, index), this.#buildJobs.length + 1));
            childs.push(tag);
        }

        for (const dir of files.filter(file => file.isDirectory())) {
            childs.push(...this.#createBMSBuildJob(dir.absPath, level + 1));
        }

        if (dirMeta.ismtp) {
            // 直接将此文件夹下所有脚本挂到上层目录
            return childs;
        }

        const cName = dirMeta.name + (dirMeta.description && `[${dirMeta.description}]`);

        return [
            new fa.FavoritesDir({
                context: cName ? cName : path.basename(dirPath),
                childs
            })
        ];
    }

    /**
     * 扫描脚本目录, 创建书签树
     */
    #scanScript() {
        lg.info(chalk.yellow(`\n1. 开始扫描脚本目录: ${this.#options.scriptRoot}\n`));
        this.#childs.push(...this.#createBMSBuildJob(this.#options.scriptRoot));
    }

    /**
     * 等待全部脚本打包完成, 之后统计结果
     */
    async #awaitJobFinush() {
        lg.info(chalk.yellow("\n2. 开始构建打包脚本\n"));
        /**@type {BuildJobRes[]} */
        const jobRes = await Promise.all(this.#buildJobs);
        let success = 0, fail = 0, unUse = 0;

        lg.info(chalk.yellow("\n打包脚本状态\n"));
        jobRes.map(job => {
            if (job.error) {
                lg.info(chalk.red("🚫" + job.scriptPath));
                lg.info(chalk.red(job.error));
                fail++;
            } else if (!job.isUse) {
                lg.info(chalk.yellow("🚮" + job.scriptPath));
                unUse++;
            } else {
                lg.info(chalk.green("✅" + job.scriptPath));
                success++;
            }
        });
        lg.info(chalk.green(`\n🚫失败:${fail} 🚮丢弃:${unUse} ✅成功:${success}`));
    }

    /**
     * 创建书签导入文件
     */
    #createBMFile() {
        const packJson = tools.readJsonFileSync("package.json");
        lg.info(chalk.yellow(`\n3. 创建书签导入文件: ${this.#options.favoritesFileName}\n`));
        const favoritesRoot = new fa.FavoritesRoot({
            title: "书签脚本集合",
            name: "书签脚本集合",
            mode: this.#args.mode,
            pname: packJson.name,
            version: packJson.version,
            author: packJson.author,
            time: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
            childs: [
                new fa.FavoritesDir({
                    context: "用户书签栏",
                    ptf: true,
                    childs: this.#childs
                })
            ]
        });

        // 保存文件
        const favoritesPath = path.resolve(this.#options.outDir, this.#options.favoritesFileName);
        tools.writeFileSync(favoritesPath, favoritesRoot.createHtml());
        lg.info(chalk.green(favoritesPath));
    }

    /**
     * 开始打包
     */
    async build() {
        lg.info(chalk.green("\n📦开始打包构建收藏夹脚本!!!"));
        tools.emptydirSync(this.#options.outDir);

        this.#scanScript();

        await this.#awaitJobFinush();

        this.#createBMFile();

        tools.emptydirSync(path.join(this.#options.outDir, this.#options.tmpName));
        lg.info(chalk.green("\n📦打包完成!!!"));
    }
}