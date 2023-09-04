import path from "path";

import dotenv from "dotenv";
import variables from "dotenv-parse-variables";
import fs from "fs-extra";

import lg from "./lg.js";

/**
 * 依据文件加载环境变量
 * @param {string} envPath 环境变量文件路径
 * @returns 环境变量
 */
function initEnv(envPath) {
    const config = dotenv.config({
        encoding: "utf-8",
        override: true,
        path: envPath
    });
    if (config.error) {
        throw config.error;
    }
    return variables(config.parsed);
}

/**
 * 加载项目环境变量
 * @param {string} envRoot 环境变量文件根目录
 * @param {string} mode 加载模式
 * @returns 项目环境变量
 */
export function loadEnv(envRoot, mode) {
    let env = {};

    // 默认加载
    const envPaths = [
        ".env",
        ".env.local",
    ];

    // 模式加载
    if (typeof mode === "string") {
        envPaths.push(`.env.${mode}`, `.env.${mode}.local`);
    }

    envPaths.forEach(envItem => {
        const envItemPath = path.resolve(envRoot, envItem);
        if (fs.existsSync(envItemPath)) {
            lg.debug("loading env: " + envItemPath);
            env = Object.assign(env, initEnv(envItemPath));
        }
    });

    return env;
}