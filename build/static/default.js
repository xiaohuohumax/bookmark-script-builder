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