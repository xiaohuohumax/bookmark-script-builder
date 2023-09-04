import path from "path";

import babel from "@babel/core";
import variables from "dotenv-parse-variables";
import fs from "fs-extra";

import { readFileSync } from "./tools.js";

/**
 * 通过meta创建注释
 * @param {any} meta 元数据
 * @returns 注释
 */
export function createCommentsByMeta(meta) {
    return [
        "/**",
        ...Object.entries(meta).map(item => ` * ${item[0]} ${item[1]}`),
        " */"
    ].join("\n");
}

/**
 * 通过行数组加载元数据
 * @param {string[]} lines 行数据
 * @param {RegExp} matchRe 匹配规则
 * @returns 元数据
 */
function loadMetaByLines(lines, matchRe) {
    const meta = {};

    lines.map(line => new RegExp(matchRe).exec(line.trim()))
        .filter(line => line)
        .forEach(lineMatch => {
            meta[lineMatch[1]] = lineMatch[2].trim();
        });

    return variables(meta);
}

/**
 * 加载普通文件元数据
 * @param {string} filePath 普通文件路径
 * @returns 文件元数据
 */
export function loadFileMeta(filePath) {
    let meta = { name: "", description: "", isuse: true, ismtp: false };

    if (!fs.existsSync(filePath)) {
        return meta;
    }

    const lines = readFileSync(filePath).split("\n");

    return Object.assign(meta, loadMetaByLines(lines, /^#(\w+)\s+(.*)$/ig));
}

/**
 * 加载脚本文件元数据
 * @param {string} scriptPath 脚本文件路径
 * @returns 脚本元数据
 */
export function loadScriptMeta(scriptPath) {
    let meta = { name: "", description: "", icon: "", version: "", isuse: false, };

    const scriptAst = babel.transformFileSync(scriptPath, { sourceType: "unambiguous", ast: true }).ast;

    const lines = [];
    for (const { type, value } of scriptAst.comments) {
        // 只接受多行注释
        if (type === "CommentBlock") {
            lines.push(...value.split("\n").map(line => line.trim()));
        }
    }

    const lineMeta = loadMetaByLines(lines, /#(\w+)\s+(.*)/ig);
    // 需要补全的相对路径key
    const relativeKeys = ["icon"];
    const scriptDir = path.parse(scriptPath).dir;

    Object.keys(lineMeta).forEach(key => {
        let metaValue = lineMeta[key];

        if (relativeKeys.includes(key)) {
            metaValue = path.join(scriptDir, metaValue);
        }
        meta[key] = metaValue;
    });

    return meta;
}