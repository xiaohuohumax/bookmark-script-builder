/**
 * #name 时间
 * #description 显示当前时间
 * #icon ./clock.png
 * #version 1.0.0
 * #isuse true
 */

import { BScript } from "@/tool/com";
import swal from "@/tool/swal";
import notify from "@/tool/notify";
import dConfig from "./clock.json";

const script = BScript.init({ matchUrl: [/.*/ig] });

script.run(async () => {
    const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
    const timHtml = `<p>当前时间:${time}</p><p>配置信息:${JSON.stringify(dConfig)}</p>`;
    swal.fire({ title: "提示", icon: "success", html: timHtml, confirmButtonText: "确定" });
}).catch(err => {
    notify.failure("存在异常!!!");
    throw err;
});