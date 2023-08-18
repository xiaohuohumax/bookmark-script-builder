import { rollup } from "rollup";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import cleanup from "rollup-plugin-cleanup";

export async function buildIIFE({ input, outputFile, externals = {}, isCompact = true, isCleanup = true }) {
    const plugins = [
        commonjs({ include: /node_modules/ }),
        resolve(),
        json(),
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
