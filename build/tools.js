import fs from "fs-extra";
import crypto from "crypto";
import mime from "mime-types";
import path from "path";

export function readFileSync(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf-8" });
}

export function writeFileSync(filePath, data) {
    fs.ensureFileSync(filePath);
    return fs.writeFileSync(filePath, data, { encoding: "utf-8" });
}

export function emptydirSync(dirPath) {
    fs.emptydirSync(dirPath);
    fs.rmdirSync(dirPath);
}

export function randomUUID() {
    return crypto.randomUUID().replaceAll("-", "");
}

export function fileToBase64(filePath) {
    return `data:${mime.lookup(filePath)};base64,${Buffer.from(fs.readFileSync(filePath)).toString("base64")}`;
}

export function normalizePath(filePath, relativePath = "") {
    const configPath = path.normalize(filePath);
    return configPath.startsWith("\\") ? configPath.substring(1) : path.join(relativePath, configPath);
}

