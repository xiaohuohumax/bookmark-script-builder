const infoLevel = {
    debug: 0,
    info: 10,
    warning: 20,
    error: 30,
};

function logByLevel(infoLevel, logLevel, isues) {
    return (...args) => (infoLevel <= logLevel) && isues ? console.log(...args) : ({});
}

function createLog({ level = infoLevel.info, isuse = true }) {
    return {
        info: logByLevel(level, infoLevel.info, isuse),
        debug: logByLevel(level, infoLevel.debug, isuse),
        warning: logByLevel(level, infoLevel.warning, isuse),
        error: logByLevel(level, infoLevel.error, isuse),
    };
}

export default createLog({ level: infoLevel.debug });