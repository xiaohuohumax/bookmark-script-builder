import chalk from "chalk";
import { build } from "./build/index.js";
import log from "./build/log.js";

build().catch((err) => {
    log.error(chalk.red(`\n存在异常:\n\n${err.stack}`));
    log.error(chalk.red("\n😿打包失败!!!"));
});