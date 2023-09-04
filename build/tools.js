import crypto from "crypto";

import fs from "fs-extra";

/**
 * 读取文件内容 UTF8
 * @param {string} filePath 文件路径
 * @returns 文件内容
 */
export function readFileSync(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf-8" });
}

/**
 * 写入文件 UTF8
 * @param {string} filePath 文件路径
 * @param {string} data 文件内容 
 */
export function writeFileSync(filePath, data) {
    fs.ensureFileSync(filePath);
    return fs.writeFileSync(filePath, data, { encoding: "utf-8" });
}

/**
 * 读取 json 文件
 * @param {string} filePath 文件路径
 * @returns json 数据
 */
export function readJsonFileSync(filePath) {
    return fs.readJSONSync(filePath, { encoding: "utf-8" });
}

/**
 * 维持文件夹 
 * - 文件夹不存在则创建
 * - 文件夹存在子文件则清除
 * @param {string} dirPath 文件夹路径
 */
export function emptydirSync(dirPath) {
    fs.emptydirSync(dirPath);
    fs.rmdirSync(dirPath);
}

/**
 * 生成随机UUID
 * @returns UUID
 */
export function randomUUID() {
    return crypto.randomUUID().replaceAll("-", "");
}

/**
 * 获取文件MD5
 * @param {string} filePath 文件路径
 * @returns 文件MD5
 */
export function loadFileMD5(filePath) {
    return crypto.createHash("md5").update(readFileSync(filePath)).digest("hex");
}