"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = void 0;
const response_1 = require("../utils/response");
const health = (_req, res) => res.json((0, response_1.ok)("ok", { timestamp: new Date().toISOString() }));
exports.health = health;
