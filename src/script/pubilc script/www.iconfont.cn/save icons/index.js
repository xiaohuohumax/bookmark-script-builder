/**
 * #name 阿里巴巴矢量图标一键下载
 * #description 可配置颜色,大小,类型等
 * #icon ../favicon.ico
 * #version v2.0.0
 * #isuse true
 */

import axios from "axios";
import Cookies from "js-cookie";
import JSZip from "jszip";
import chunk from "lodash/chunk";

import { lg, notify, swal } from "@/tool/base";
import { q, qa, BScript } from "@/tool/core";
import { dlAndZipByTask, DTask, DFile } from "@/tool/dl";

import dConfig from "./index.json";
import "./index.css";

// 类型映射
const typeMap = {
    svg: "SVG",
    eps: "AI",
    png: "PNG"
};

/**
 * 用户设置下载配置
 * @returns 配置信息
 */
async function loadConfig() {
    return swal.fire({
        title: "设置",
        html: `<div class='icon-form'>
            <div>
                <label class='swal2-input-label'>图标类型:</label>
                <div class='swal2-radio'>
                    ${Object.entries(typeMap).map(item => `<label><input type='radio' name='icon-type' value='${item[0]}' ${dConfig.type == item[0] ? "checked" : ""}/>${item[1]}</label>`).join("")}
                </div>
            </div>
            <div>
                <label class='swal2-input-label' for='icon-color'>图标颜色 [000000,FFFFFF]:</label>
                <div class="icon-color">
                    <input type='text' name='icon-color' id='icon-color' value='${dConfig.color}' placeholder='默认' class='swal2-input'/>
                </div>
            </div>
            <div>
                <label class='swal2-input-label' for='icon-size'>图标大小 [10,5000]:</label>
                <input type='number' name='icon-size' min="20" id='icon-size' value='${dConfig.size}' min='10' max='5000'  class='swal2-input' />
            </div>
        </div>`,
        focusConfirm: false,
        confirmButtonText: "确定",
        preConfirm: () => {
            const size = parseInt(q("#icon-size").value);
            const color = q("#icon-color").value.trim();

            if (size > 5000 || size < 10) {
                swal.showValidationMessage("图标大小范围 [10,5000]");
                return;
            }

            if (color !== "" && color.match(/[0-9a-fA-F]{6}/ig) == null) {
                swal.showValidationMessage("颜色范围 [000000,FFFFFF]");
                return;
            }

            return {
                ...dConfig,
                type: qa("input[name='icon-type']").find(item => item.checked).value,
                color,
                size
            };
        },
    });
}

/**
 * 图标下载任务
 */
class DIconZipTask extends DTask {
    /**
     * @param {string[]} iconIds 图标 ID 集合
     * @param {dConfig} config 下载配置
     * @param {string} ctoken token
     * @param {number} index 任务 index
     * @param {number} zipCount 图包总数统计
     */
    constructor(iconIds, config, ctoken, index, zipCount) {
        super();
        this.iconIds = iconIds;
        this.config = config;
        this.ctoken = ctoken;
        this.index = index;
        this.zipCount = zipCount;
    }

    /**
     * 下载图包, 每次100枚
     */
    async run() {
        notify.info(`正在下载:${this.index + 1}/${this.zipCount}`);
        // 下载
        const { data } = await axios({
            url: "/api/icon/downloadIcon",
            method: "get",
            responseType: "blob",
            params: {
                type: this.config.type,
                ids: this.iconIds.map(icon => icon.trim() + "|-1").join(","),
                color: this.config.color,
                size: this.config.size,
                ctoken: this.ctoken
            }
        });

        // 异常下载
        if (!(data instanceof Blob)) {
            notify.failure(data.message);
            lg.error(data.message);
            return;
        }

        const { files } = await (JSZip.loadAsync(data));

        Object.entries(files)
            .filter(file => !file[1].dir)
            .forEach(file => {
                // 提取图包中图标数据到总包中
                this.saveFile(new DFile(file[0].split("/").pop(), file[1].async("blob")));
            });
    }
}

const script = BScript.init({
    matchUrl: [/https?:\/\/www.iconfont.cn\/collections\/detail/ig],
    unMatchMsg: "请到图标详细页再试试<br/>/collections/detail"
});

script.run(async () => {
    lg.info("开始下载");
    // 设置参数
    /**@type {{value:dConfig}} */
    const { value: config, isConfirmed } = await loadConfig();
    if (!isConfirmed) {
        notify.warning("已取消!");
        return;
    }

    notify.info(`类型:${typeMap[config.type]},颜色:${config.color || "默认"},大小:${config.size}`);
    lg.debug("参数: " + JSON.stringify(config));

    // 全部图标的id
    const iconIds = qa("li[class^='J_icon_id_']").map(item => item.className.trim().slice(10, 18));
    lg.debug("图标ID集合: " + iconIds);

    const downloadCount = 100;
    // 获取库的名称
    const iconTitle = q(".title > span").innerText;
    const zipCount = Math.ceil(iconIds.length / downloadCount);
    const ctoken = Cookies.get("ctoken");
    lg.debug("ctoken: " + ctoken);

    const fileName = `${iconTitle}.${typeMap[config.type].toLocaleLowerCase()}`;
    lg.debug("文件名: " + fileName);

    // 创建下载任务
    const tasks = chunk(iconIds, downloadCount)
        .map((iconIds, index) => new DIconZipTask(iconIds, config, ctoken, index, zipCount));

    await dlAndZipByTask(tasks, fileName, 3);

    notify.success("下载完成!", { closeButton: true });
}).catch(err => {
    notify.failure("存在异常!!!");
    lg.error(err);
});