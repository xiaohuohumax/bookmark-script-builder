import variables from "dotenv-parse-variables";
import minimist from "minimist";

/**
 * 解析命令参数
 * @returns 命令行参数
 */
export function loadArgs() {
    return variables(minimist(process.argv.slice(2)));
}