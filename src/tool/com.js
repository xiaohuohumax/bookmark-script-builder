import msg from "./msg";

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

const scriptKey = "___tag_script_flag___";

export async function start({ matchUrl = [/.*/ig], unmatchMsg = "" }, runCallback = async () => { }) {
    const matchRe = matchUrl.find(re => location.href.match(re) != null);
    if (matchRe == null) {
        msg({ title: unmatchMsg, icon: "error" });
        return;
    }
    if (typeof (runCallback) !== "function") {
        return;
    }
    if (window[scriptKey] === true) {
        return;
    }
    window[scriptKey] = true;
    try {
        return await runCallback();
    } finally {
        window[scriptKey] = false;
    }
}