import { rollup } from "rollup";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import cleanup from "rollup-plugin-cleanup";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import path from "path";

export async function buildIIFE({ input, outputFile, externals = {}, isCompact = true, isCleanup = true, }) {
    const plugins = [
        commonjs({ include: /node_modules/ }),
        nodeResolve(),
        json(),
        postcss({
            plugins: [cssnano(), autoprefixer()]
        }),
        alias({
            entries: [
                { find: "$script", replacement: path.resolve(path.resolve(), "src/script") },
                { find: "$tool", replacement: path.resolve(path.resolve(), "src/tool") },
                { find: "@", replacement: path.resolve(path.resolve(), "src") },
            ]
        }),
    ];

    if (isCleanup) {
        plugins.push(cleanup());
    }

    const bundle = await rollup({
        external: Object.keys(externals),
        input,
        plugins
    });

    await bundle.write({
        file: outputFile,
        format: "iife",
        globals: externals,
        compact: isCompact
    });
}
