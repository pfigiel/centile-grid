"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_react_namespace_1 = __importDefault(require("./rules/no-react-namespace"));
const plugin = {
    rules: {
        'no-react-namespace': no_react_namespace_1.default,
    },
};
exports.default = plugin;
