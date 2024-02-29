/**
 * #name VIP视频解析
 * #description 各种VIP视频解析
 * #icon ../vip.png
 * #version 1.0.0
 * #isuse true
 */

import { lg, notify, swal } from "@/tool/base";
import { q, BScript } from "@/tool/core";

import vipJson from "./vip.json";

const script = BScript.init({
    matchUrl: [
        /\w+:\/\/\w+.iqiyi.com/ig,
        /\w+:\/\/\w+.youku.com/ig,
        /\w+:\/\/\w+.le.com/ig,
        /\w+:\/\/\w+.letv.com/ig,
        /\w+:\/\/v.qq.com/ig,
        /\w+:\/\/\w+.tudou.com/ig,
        /\w+:\/\/\w+.mgtv.com/ig,
        /\w+:\/\/film.sohu.com/ig,
        /\w+:\/\/tv.sohu.com/ig,
        /\w+:\/\/\w+.acfun.cn\/v/ig,
        /\w+:\/\/\w+.bilibili.com/ig,
        /\w+:\/\/vip.1905.com\/play/ig,
        /\w+:\/\/\w+.pptv.com/ig,
        /\w+:\/\/\w+.wasu.cn\/Play\/show/ig,
        /\w+:\/\/\w+.56.com/ig,
    ]
});

script.run(async () => {
    const { value: config, isConfirmed } = await swal.fire({
        title: "选择解析接口",
        html: `<div>
            <select id="select-api"  class='swal2-select'>
                ${vipJson.map((vip, index) => `<option ${index == 0 ? "selected" : ""} value="${vip.api}">${vip.name}</option>`)}
            </select>
        </div>`,
        width: 420,
        focusConfirm: false,
        confirmButtonText: "确定",
        preConfirm: () => {
            const selectApi = q("#select-api");
            const selectApiValue = selectApi.options[selectApi.selectedIndex].value;
            return {
                selectApiValue
            };
        },
    });

    if (!isConfirmed) {
        notify.warning("已取消!");
        return;
    }

    window.open(config.selectApiValue.replace("%url%", window.location.href));
}).catch(err => {
    notify.failure("存在异常!!!");
    lg.error(err);
});
