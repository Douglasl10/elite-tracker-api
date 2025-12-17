"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMongo = setupMongo;
const mongoose_1 = __importDefault(require("mongoose"));
async function setupMongo() {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            return;
        }
        const { MONGO_URL: mongoUrl } = process.env;
        console.log("🎲 connecting to database...");
        await mongoose_1.default.connect(String(mongoUrl), {
            serverSelectionTimeoutMS: 3000,
        });
        console.log("✅ Connected to database");
    }
    catch (err) {
        throw new Error("❌ Error connecting to database: " + err);
    }
}
