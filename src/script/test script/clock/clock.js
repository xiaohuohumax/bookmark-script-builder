/**
 * #name 时间
 * #description 显示当前时间
 * #icon ./clock.png
 * #version 1.0.0
 * #config ./clock.json
 * #isuse true
 */

import swal from "sweetalert";
// 配置信息, 由注释 #config 的JSON文件提供
import uConfig from "$config";
// 默认配置
import dConfig from "./clock.json";
// 整合配置
const config = { ...dConfig, ...uConfig };

const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

const timeBody = document.createElement("div");
timeBody.innerHTML = `<div><p>当前时间:${time}</p><p>配置信息:${JSON.stringify(config)}</p></div>`;

swal({ title: "提示", icon: "success", content: { element: timeBody }, button: "确定" });