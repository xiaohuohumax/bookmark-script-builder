import path from "path";

import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcssImport from "postcss-import";
import { rollup } from "rollup";
import cleanup from "rollup-plugin-cleanup";
import postcss from "rollup-plugin-postcss";

import { virtualPlugin } from "./plugins/virtual.js";

/**
 * 通过rollup将代码打包成IIFE格式
 * @param {string} input 脚本文件入口路径
 * @param {string} outputFile 打包输出路径
 * @param {boolean} isTerser 是否压缩混淆
 * @param {any} meta 元数据
 * @param {any} env 环境变量
 */
export async function buildIIFE(input, outputFile, isTerser = true, meta = {}, env = {}) {

    // 替换环境变量 import.meta.env.[...]
    const envValues = {};
    Object.keys(env).forEach(envKey => envValues["import.meta.env." + envKey] = JSON.stringify(env[envKey]));

    const plugins = [
        commonjs({ include: /node_modules/ }),
        resolve({ preferBuiltins: true, browser: true }),
        json(),
        postcss({
            plugins: [
                cssnano(),
                autoprefixer(),
                postcssImport()
            ]
        }),
        // 路径别名 @,#
        alias({
            entries: [
                { find: "@", replacement: path.resolve(path.resolve(), "src") },
                { find: "#", replacement: path.resolve() },
            ]
        }),
        cleanup(),
        // 加载虚拟模块 注入元数据
        virtualPlugin(meta),

        // 替换环境变量
        replace({
            preventAssignment: true,
            values: {
                ...envValues
            }
        })
    ];

    if (isTerser) {
        plugins.push(terser());
    }

    const bundle = await rollup({
        input,
        plugins
    });

    await bundle.write({
        file: outputFile,
        format: "iife",
        compact: true
    });
}
