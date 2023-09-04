/**
 * 休眠, 时间可能远超设定值
 * 
 * 例如: await sleep(1000);
 * @param {number} ms 休眠时长 毫秒
 */
export function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}