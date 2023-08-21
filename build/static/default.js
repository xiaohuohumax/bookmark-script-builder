document.querySelectorAll("dt > a").forEach((element) => {
    const i = document.createElement("i");
    const icon = element.getAttribute("icon")?.trim();
    if (!icon) {
        i.style.border = "1px solid var(--link-hover-color)";
    } else {
        i.style.background = `url(${icon}) no-repeat`;
        i.style.backgroundSize = "cover";
    }
    element.prepend(i);
});

document.querySelectorAll("dt > h3").forEach((element) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("checked", true);
    element.appendChild(input);
});

const checkboxAll = document.querySelector("#checkbox-all");
const itemCheckbox = document.querySelectorAll("dl input[type='checkbox']");

checkboxAll.addEventListener("change", () => {
    itemCheckbox.forEach(item => item.checked = checkboxAll.checked);
});