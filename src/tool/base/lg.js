import { getLogger } from "loglevel";

const lg = getLogger("logging");
lg.setLevel(import.meta.env.LOGGING_LEVEL);

export { lg };