import notify from "./notify";

/**@param {string} selectors*/
export function q(selectors) {
    return document.querySelector(selectors);
}
/**@param {string} selectors */
export function qa(selectors) {
    return document.querySelectorAll(selectors);
}
/**@param {number} ms */
export function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}
export class BScript {
    static flagKey = "___tag_script_flag___";
    static matchUrl = [];
    static unMatchMsg = "";

    static {
        BScript.init({});
    }

    /**@param {{ matchUrl:RegExp[], unMatchMsg:string }} options */
    static init({ matchUrl = [/.*/ig], unMatchMsg = "请到目标网页再试试" }) {
        BScript.matchUrl = matchUrl;
        BScript.unMatchMsg = unMatchMsg;
        return BScript;
    }

    static async run(callback = async () => { }) {
        const matchRe = BScript.matchUrl.find(re => location.href.match(re) != null);
        if (matchRe == null) {
            notify.failure(BScript.unMatchMsg, { plainText: false });
            return;
        }
        if (window[BScript.flagKey] === true) {
            return;
        }
        window[BScript.flagKey] = true;
        try {
            return await callback();
        } finally {
            window[BScript.flagKey] = false;
        }
    }
}
