"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(request, response, next) {
    const authToken = request.headers.authorization;
    if (!authToken) {
        return response.status(401).json({ error: "Token not provided" });
    }
    const [, token] = authToken.split(" ");
    try {
        jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET), (error, decoded) => {
            if (error) {
                throw new Error();
            }
            request.user = decoded;
            return next();
        });
    }
    catch (error) {
        return response.status(401).json({ error: "Invalid token" });
    }
}
exports.default = authMiddleware;
