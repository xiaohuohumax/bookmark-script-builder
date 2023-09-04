/**
 * 通过规则搜索第一个符合要求的标签
 * @param {string} selectors 搜寻规则
 * @returns 搜索到的元素
 */
export function q(selectors) {
    return document.querySelector(selectors);
}

/**
 * 通过规则搜索全部符合要求的标签
 * @param {string} selectors 搜索规则
 * @returns 搜索到的元素集合
 */
export function qa(selectors) {
    return Array.from(document.querySelectorAll(selectors));
}