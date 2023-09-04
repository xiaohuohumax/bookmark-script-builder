import meta from "virtual:meta";

import { name } from "#/package.json";

import { lg, notify } from "../base";

/**
 * 书签脚本基础
 */
export class BScript {
    static flagKey = "___tag_script_flag___";
    static matchUrl = [];
    static unMatchMsg = "";
    static isShowMeta = true;
    static isAddBeforeUnload = true;

    static {
        BScript.init({});
    }

    /**
     * 初始化
     */
    static init({ matchUrl = [/.*/ig], unMatchMsg = "请到目标网页再试试", isShowMeta = true, isAddBeforeUnload = true }) {
        BScript.matchUrl = matchUrl;
        BScript.unMatchMsg = unMatchMsg;
        BScript.isShowMeta = isShowMeta;
        BScript.isAddBeforeUnload = isAddBeforeUnload;
        return BScript;
    }

    /**
     * 执行脚本
     * @param {Promise<any>} callback 脚本执行回调
     * @returns 执行结果 
     */
    static async run(callback = async () => { }) {
        if (window[BScript.flagKey] === true) {
            // 阻止位置完成多次调用
            return;
        }

        window[BScript.flagKey] = true;

        if (BScript.isAddBeforeUnload) {
            // 是否添加离开提示
            window.addEventListener("beforeunload", (event) => {
                if (window[BScript.flagKey] === true) {
                    event.preventDefault();
                    event.returnValue = "$";
                    return "$";
                }
            });
        }
        if (BScript.isShowMeta) {
            // 是否展示脚本信息
            lg.info(`%cwelcome use ${name}!`, "color:#1e80ff;font-size:20px;");
            const metaInfo = meta.name + (meta.description && `[${meta.description}]`) + (meta.version && `(${meta.version})`);
            lg.info(`%c${metaInfo}`, "color:#1e80ff;font-size:14px;");
        }

        const matchRe = BScript.matchUrl.find(re => location.href.match(re) != null);
        if (matchRe == null) {
            // 脚本目标网址提示
            notify.failure(BScript.unMatchMsg, { plainText: false });
            window[BScript.flagKey] = false;
            return;
        }

        try {
            return await callback();
        } finally {
            window[BScript.flagKey] = false;
        }
    }
}
