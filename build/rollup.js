import { rollup } from "rollup";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";
import cleanup from "rollup-plugin-cleanup";
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import path from "path";

export async function buildIIFE({ input, outputFile, isTerser = true }) {
    const plugins = [
        commonjs({ include: /node_modules/ }),
        nodeResolve({ preferBuiltins: true, browser: true }),
        json(),
        postcss({
            plugins: [cssnano(), autoprefixer(), postcssImport()]
        }),
        alias({
            entries: [
                { find: "$script", replacement: path.resolve(path.resolve(), "src/script") },
                { find: "$tool", replacement: path.resolve(path.resolve(), "src/tool") },
                { find: "@", replacement: path.resolve(path.resolve(), "src") },
            ]
        }),
        cleanup(),
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
