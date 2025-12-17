"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Token not provided" });
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Token malformatted" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: "JWT_SECRET not configured" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // adiciona dados do usuário no request
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
exports.default = authMiddleware;
