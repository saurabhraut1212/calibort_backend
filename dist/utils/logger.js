"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const info = (...args) => {
    // eslint-disable-next-line no-console
    console.log("[info]", ...args);
};
const warn = (...args) => {
    // eslint-disable-next-line no-console
    console.warn("[warn]", ...args);
};
const error = (...args) => {
    // eslint-disable-next-line no-console
    console.error("[error]", ...args);
};
exports.default = { info, warn, error };
