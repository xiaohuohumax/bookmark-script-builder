/**
 * #name 阿里巴巴矢量图标一键下载
 * #description 可配置颜色,大小,类型等
 * #icon ../favicon.ico
 * #version v2.0.0
 * #isuse true
 */

import Axios from "axios";
import Cookies from "js-cookie";
import _ from "lodash";
import FileSaver from "file-saver";
import pLimit from "p-limit";
import JSZip from "jszip";
import notify from "@/tool/notify";
import swal from "@/tool/swal";
import { q, qa, BScript } from "@/tool/com";
import dConfig from "./index.json";
import "./index.css";

const typeMap = {
    svg: "SVG",
    eps: "AI",
    png: "PNG"
};

async function setConfig() {
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
                type: Array.from(qa("input[name='icon-type']")).find(item => item.checked).value,
                color,
                size
            };
        },
    });
}

async function downloadItemZip(iconIds, config, ctoken) {
    const { data } = await Axios({
        url: "/api/icon/downloadIcon",
        method: "get",
        responseType: "blob",
        params: {
            type: config.type,
            ids: iconIds.map(icon => icon.trim() + "|-1").join(","),
            color: config.color,
            size: config.size,
            ctoken
        }
    });

    if (!(data instanceof Blob)) {
        notify.failure(data.message);
        return [];
    }

    const itemZip = new JSZip();
    const itemZipData = await (itemZip.loadAsync(data));
    return Object.keys(itemZipData.files)
        .filter(file => !itemZip.files[file].dir)
        .map(file => ({
            fName: file.split("/").reverse()[0],
            fBlob: itemZip.files[file].async("blob")
        }));
}

const script = BScript.init({
    matchUrl: [/https?:\/\/www.iconfont.cn\/collections\/detail/ig],
    unMatchMsg: "请到图标详细页再试试<br/>/collections/detail"
});

script.run(async () => {
    // 设置参数
    /**@type {{value:dConfig}} */
    const { value: config, isConfirmed } = await setConfig();
    if (!isConfirmed) {
        notify.warning("已取消!");
        return;
    }
    notify.info(`类型:${typeMap[config.type]},颜色:${config.color || "默认"},大小:${config.size}`);
    // 全部图标的id
    const iconIds = Array.from(document.querySelectorAll("li[class^='J_icon_id_']"))
        .map(item => item.className.trim().slice(10, 18));

    const downloadCount = 100;
    // 获取库的名称
    const iconTitle = q(".title > span").innerText;
    const zipCount = Math.ceil(iconIds.length / downloadCount);
    const ctoken = Cookies.get("ctoken");
    const allZip = new JSZip();

    // 同时下载数
    const limit = pLimit(3);

    const results = await Promise.all(_.chunk(iconIds, downloadCount)
        .map((iconIds, index) => limit(async () => {
            notify.info(`正在下载:${index + 1}/${zipCount}`);
            return downloadItemZip(iconIds, config, ctoken);
        })));

    results.flat(Infinity).forEach(files => allZip.file(files.fName, files.fBlob));

    // 保存
    const content = await allZip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, `${iconTitle}.${typeMap[config.type].toLocaleLowerCase()}.zip`);

    notify.success("下载完成!");
}).catch(err => {
    notify.failure("存在异常!!!");
    throw err;
});