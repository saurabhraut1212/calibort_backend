"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const port = config_1.default.server.port;
app_1.default.listen(port, () => {
    logger_1.default.info(`Server listening on port ${port} in ${config_1.default.server.env} mode`);
});
