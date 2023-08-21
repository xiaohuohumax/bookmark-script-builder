import fs from "fs-extra";
import path from "path";
import { createScriptMeta, getFavoritesFileMeta, getScriptMeta } from "./meta.js";
import * as fa from "./favorites.js";
import { buildIIFE } from "./rollup.js";
import { randomUUID, writeFileSync, readFileSync, fileToBase64, normalizePath, emptydirSync } from "./tools.js";
import chalk from "chalk";
import log from "./log.js";


const defaultOptions = {
    // 打包输出路径
    outDir: "dist",
    // 脚本根目录
    scriptRoot: "src/script",
    // 收藏夹导入文件名称
    favoritesFileName: "favorites.html",
    // 收藏夹版本文件夹名称
    favoritesDirName: "favorites",
    // 控制台版本文件夹名称
    consoleDirName: "console",
    // 缓存文件夹名称
    tmpName: "tmp",
    // 脚本支持打包格式
    scriptExts: [".js", ".mjs"],
    // 默认文件
    defaultPath: "build/static",
    default: {
        icon: "default.png",
        css: "default.css",
        script: "default.js"
    },
    // 虚拟模块名称-导入配置
    configVirtualName: "$config",
    // 文件夹配置文件名称
    favoritesMetaName: ".favorites"
};

/**
 * @param {string} dirPath
 * @param {string} dirName
 * @param {defaultOptions} options
 * @param {number} deepLevel
 */
async function buildDir(dirPath, dirName, options, deepLevel) {
    const spaces = " ".repeat(deepLevel);
    log.debug(chalk.green(`${spaces}📁${dirPath}`));
    const favoritesMetaPath = path.join(dirPath, options.favoritesMetaName);

    let context = dirName;
    let childs = [];
    if (fs.existsSync(favoritesMetaPath)) {
        const meta = getFavoritesFileMeta(favoritesMetaPath);
        const { name, description, isuse, ismtp } = meta;
        log.debug(chalk.gray(`${spaces}↪[dmeta] ${JSON.stringify(meta)}`));

        if (isuse !== "true") {
            return childs;
        }
        context = name + (description  && `[${description}]`);
        context = context == "" ? dirName : context;
        childs = await walkFavoritesScript(dirPath, options, deepLevel + 2);

        if (ismtp === "true") {
            // 跳过当前层级,直接挂到父目录下
            return childs;
        }
    }

    return new fa.FavoritesDir({
        CONTEXT: context,
        childs
    });
}

/**
 * @param {string} scriptPath
 * @param {defaultOptions} options
 * @param {number} deepLevel
 */
async function buildTag(scriptPath, options, deepLevel) {
    const spaces = " ".repeat(deepLevel);
    log.debug(chalk.green(`${spaces}📄${scriptPath}`));
    const meta = getScriptMeta(scriptPath);
    const { name, description, icon, version, config, isuse } = meta;

    log.debug(chalk.gray(`${spaces}↪[fmeta] ${JSON.stringify(meta)}`));
    if (isuse !== "true") {
        return;
    }
    const metaRes = createScriptMeta({
        "名称": name,
        "版本": version,
        "描述": description
    });

    const scriptParentPath = path.parse(scriptPath).dir;

    const configPath = normalizePath(config, scriptParentPath);
    const configData = fs.existsSync(configPath) && configPath.endsWith(".json") ? fs.readJsonSync(configPath) : {};

    const consoleTmpPath = path.join(options.outDir, options.tmpName, randomUUID());
    await buildIIFE({ input: scriptPath, outputFile: consoleTmpPath, externals: { [options.configVirtualName]: "config" } });

    // 控制台版本
    const outConsolePath = path.join(options.outDir, options.consoleDirName, scriptPath.replace(path.join(options.scriptRoot), ""));
    const consoleScriptContext = `${metaRes}\n\nconst config = ${JSON.stringify(configData, undefined, 4)};\n\n${readFileSync(consoleTmpPath)}`;
    writeFileSync(outConsolePath, consoleScriptContext);

    log.debug(chalk.gray(`${spaces}↪[console] ${outConsolePath}`));

    // 浏览器标签版本
    await buildIIFE({ input: scriptPath, outputFile: consoleTmpPath, externals: { [options.configVirtualName]: "{}" } });
    const favoritesScriptContext = `javascript: ${encodeURI(readFileSync(consoleTmpPath))}void(0);`;
    const outFavoritesPath = path.join(options.outDir, options.favoritesDirName, scriptPath.replace(path.join(options.scriptRoot), "") + ".txt");
    writeFileSync(outFavoritesPath, `${metaRes}\n\n${favoritesScriptContext}`);
    log.debug(chalk.gray(`${spaces}↪[favorites] ${outFavoritesPath}`));

    const iconPath = icon == "" ? path.join(options.defaultPath, options.default.icon) : normalizePath(icon, scriptParentPath);
    return new fa.FavoritesTag({
        CONTEXT: name + (description && `[${description}]`) + (version && `(${version})`),
        ICON: fs.existsSync(iconPath) ? fileToBase64(iconPath) : undefined,
        HREF: favoritesScriptContext
    });
}

/**
 * @param {string} scriptPath 
 * @param {defaultOptions} options 
 * @param {number} deepLevel
 */
async function walkFavoritesScript(scriptPath, options, deepLevel = 0) {
    scriptPath = path.join(scriptPath);
    /**@type { import('./favorites').FavoritesBase[] } */
    let res = [];
    if (!fs.existsSync(scriptPath)) {
        return res;
    }
    for (const file of fs.readdirSync(scriptPath, { withFileTypes: true })) {
        const filePath = path.join(scriptPath, file.name);
        const fileExt = path.parse(file.name).ext;
        if (file.isDirectory()) {
            // 文件夹
            const buildRes = await buildDir(filePath, file.name, options, deepLevel);
            if (buildRes instanceof fa.FavoritesDir) {
                res.push(buildRes);
            } else {
                // skip or unused
                res = res.concat(buildRes);
            }
        } else if (file.isFile() && options.scriptExts.includes(fileExt)) {
            // 文件
            const buildRes = await buildTag(filePath, options, deepLevel);
            if (buildRes instanceof fa.FavoritesTag) {
                res.push(buildRes);
            }
        }
    }
    return res;
}

export async function build(options = defaultOptions) {
    log.info(chalk.green("📦开始打包构建收藏夹脚本!!!\n"));
    options.default = { ...defaultOptions.default, ...options.default };
    options = { ...defaultOptions, ...options };

    log.debug(chalk.gray(`配置信息: ${JSON.stringify(options, undefined, 2)}`));
    emptydirSync(options.outDir);

    log.info(chalk.yellow(`1. 开始扫描脚本目录: ${options.scriptRoot}`));
    const childs = await walkFavoritesScript(options.scriptRoot, options);

    log.info(chalk.yellow("2. 开始构建收藏夹"));

    const favoritesRoot = new fa.FavoritesRoot({
        TITLE: "收藏夹脚本集合",
        CONTEXT: "收藏夹脚本集合",
        ICON: fileToBase64(path.join(options.defaultPath, options.default.icon)),
        STYLE: readFileSync(path.join(options.defaultPath, options.default.css)),
        SCRIPT: readFileSync(path.join(options.defaultPath, options.default.script)),
        SUBCONTEXT: `<H4>使用方式:</H4>
        <H5>全部导入:</H5>
        <UL>
            <LI>将此文件[${options.favoritesFileName}]导入浏览器</LI>
            <LI>到对应的网页点击收藏夹标签即可执行脚本</LI>
        </UL>
        <H5>单独添加:</H5>
        <UL>
            <LI>直接点住脚本链接拖到浏览器的收藏夹/书签中</LI>
            <LI>到对应的网页点击收藏夹标签即可执行脚本</LI>
        </UL>`,
        childs: [
            new fa.FavoritesDir({
                CONTEXT: "用户脚本",
                PERSONAL_TOOLBAR_FOLDER: true,
                childs: childs
            })
        ]
    });

    const favoritesPath = path.join(options.outDir, options.favoritesFileName);
    log.info(chalk.yellow(`3. 开始将收藏夹保存至文件: ${favoritesPath}`));
    writeFileSync(favoritesPath, favoritesRoot.createHtml());

    const tmpPath = path.join(options.outDir, options.tmpName);
    log.info(chalk.yellow(`4. 开始收尾清理: ${tmpPath}`));
    emptydirSync(tmpPath);

    log.info(chalk.green(`\n📦打包成功: ${favoritesPath}`));
}