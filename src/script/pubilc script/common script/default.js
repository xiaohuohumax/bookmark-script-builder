/**
 * #name 默认
 * #description 这里啥也没有
 * #icon
 * #version 1.0.0
 * #isuse true
 */

import meta from "virtual:meta";

import { lg, notify } from "@/tool/base";
import { BScript } from "@/tool/core";

const script = BScript.init({ matchUrl: [/.*/ig] });

script.run(async () => {
    notify.success("这里啥也没有!!");
    notify.info("meta: " + JSON.stringify(meta));
}).catch(err => {
    notify.failure("存在异常!!!");
    lg.error(err);
});
