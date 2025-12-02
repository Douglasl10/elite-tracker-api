"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const database_1 = require("./database");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
(0, database_1.setupMongo)().then(() => {
    app.use((0, cors_1.default)({
        origin: "http://localhost:5173"
    }));
    app.use(express_1.default.json());
    app.use(routes_1.routes);
    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
}).catch((err) => {
    console.error(err.message);
    process.exit(1);
});
