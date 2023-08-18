class Favorites {
    createTag() {
        return [];
    }
}

export class FavoritesBase extends Favorites {
    constructor({ CONTEXT = "", ADD_DATE = 0 }) {
        super();
        this.createTime = new Date();
        this.ADD_DATE = ADD_DATE || this.createTime.getTime();
        this.CONTEXT = CONTEXT ?? "";
    }
}

export class FavoritesDir extends FavoritesBase {
    constructor({ CONTEXT = "", ADD_DATE = 0, LAST_MODIFIED = 0, PERSONAL_TOOLBAR_FOLDER = false, childs = [] }) {
        super({ CONTEXT, ADD_DATE });
        this.LAST_MODIFIED = LAST_MODIFIED || this.createTime.getTime();
        this.PERSONAL_TOOLBAR_FOLDER = PERSONAL_TOOLBAR_FOLDER ?? false;
        /**@type {FavoritesBase[]} */
        this.childs = childs;
    }
    createTag() {
        const ptf = this.PERSONAL_TOOLBAR_FOLDER ? " PERSONAL_TOOLBAR_FOLDER=\"true\"" : "";

        return [
            `<DT><H3 ADD_DATE="${this.ADD_DATE}" LAST_MODIFIED="${this.LAST_MODIFIED}"${ptf}>${this.CONTEXT}</H3>`,
            "<DL><p>",
            ...this.childs.map(item => item.createTag()).flat(Infinity).map(item => `\t${item}`),
            "</DL><p>",
        ];
    }
}

export class FavoritesTag extends FavoritesBase {
    constructor({ CONTEXT = "", ADD_DATE = 0, HREF = "", ICON = "" }) {
        super({ CONTEXT, ADD_DATE });
        this.HREF = HREF ?? "";
        this.ICON = ICON ?? "";
    }
    createTag() {
        const icon = this.ICON ? ` ICON="${this.ICON}"` : "";

        return [
            `<DT><A HREF="${this.HREF}" ADD_DATE="${this.ADD_DATE}"${icon}>${this.CONTEXT}</A>`,
        ];
    }
}

export class FavoritesRoot extends Favorites {
    constructor({ childs = [], TITLE = "", CONTEXT = "", SUBCONTEXT = "", ICON = "", STYLE = "", SCRIPT = "" }) {
        super();
        this.TITLE = TITLE;
        this.ICON = ICON;
        this.CONTEXT = CONTEXT;
        this.STYLE = STYLE;
        this.SCRIPT = SCRIPT;
        this.SUBCONTEXT = SUBCONTEXT;
        /**@type {FavoritesBase[]} */
        this.childs = childs;
    }
    createTag() {
        return [
            "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
            "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=UTF-8\">",
            `<TITLE>${this.TITLE}</TITLE>`,
            `<LINK rel="shortcut icon" href="${this.ICON}">`,
            `<STYLE>${this.STYLE}</STYLE>`,
            `<H1>${this.CONTEXT}</H1>`,
            `<H5>${this.SUBCONTEXT}</H5>`,
            "<DL><p>",
            ... this.childs.map(item => item.createTag()).flat(Infinity).map(item => `\t${item}`),
            "</DL><p>",
            `<SCRIPT>${this.SCRIPT}</SCRIPT>`
        ];
    }
    createHtml() {
        return this.createTag().join("\n");
    }
}
