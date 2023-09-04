import chalk from "chalk";

import { BookmarkScriptBuilder } from "./build/index.js";
import lg from "./build/lg.js";

const builder = BookmarkScriptBuilder.init();

builder.build().catch((err) => {
    lg.error(chalk.red(`\n存在异常:\n\n${err.stack}`));
    lg.error(chalk.red("\n😿打包失败!!!"));
});