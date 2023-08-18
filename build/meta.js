import babel from "@babel/core";
import fs from "fs-extra";
import { readFileSync } from "./tools.js";

export function getFavoritesFileMeta(favoritesPath) {
    if (!fs.existsSync(favoritesPath)) {
        return {};
    }
    const lines = readFileSync(favoritesPath).split("\n");
    const res = lines
        .map(line => Array.from(line.matchAll(/^#(\w+)\s+(.*)\s*/ig))
            .map(item => ({ [item[1].trim()]: item[2].trim() })))
        .flat(Infinity)
        .reduce((i1, i2) => ({ ...i1, ...i2 }));

    return {
        name: "", description: "", isuse: "true", ismtp: "false",
        ...res
    };
}

export function createScriptMeta(meta) {
    return [
        "/**",
        ...Object.entries(meta).map(item => ` * ${item[0]} ${item[1]}`),
        " */"
    ].join("\n");
}

export function getScriptMeta(scriptPath) {
    const scriptAst = babel.transformFileSync(scriptPath, { sourceType: "unambiguous", ast: true }).ast;

    const res = scriptAst.comments
        .filter(item => item.type === "CommentBlock")
        .map(item => item.value.split("\n"))
        .flat(Infinity)
        .map(item => Array.from(item.matchAll(/#(\w+)\s+(.*)[^\r\n]*/ig))
            .map(item => ({ [item[1].trim()]: item[2].trim() })))
        .flat(Infinity)
        .reduce((i1, i2) => ({ ...i1, ...i2 }));

    return {
        name: "", description: "", icon: "", version: "", config: "", isuse: "false",
        ...res
    };
}