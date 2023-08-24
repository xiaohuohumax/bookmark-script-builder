/**
 * #name 默认
 * #description 这里啥也没有
 * #icon
 * #version 1.0.0
 * #isuse true
 */

import { BScript } from "@/tool/com";
import notify from "@/tool/notify";

const script = BScript.init({ matchUrl: [/.*/ig] });

script.run(async () => {
    notify.success("这里啥也没有!!");
}).catch(err => {
    notify.failure("存在异常!!!");
    throw err;
});
