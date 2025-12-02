"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const axios_1 = __importStar(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";
class AuthController {
    constructor() {
        this.auth = async (request, response) => {
            const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
            response.status(200).json({ redirectUrl });
        };
        this.authCallback = async (request, response) => {
            try {
                const { code } = request.query;
                const accessTokenResult = await axios_1.default.post("https://github.com/login/oauth/access_token", {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                }, {
                    headers: {
                        "Accept": "application/json"
                    }
                });
                const userDataResult = await axios_1.default.get("https://api.github.com/user", {
                    headers: {
                        "Authorization": `Bearer ${accessTokenResult.data.access_token}`
                    }
                });
                const { node_id: id, avatar_url: avatarUrl, name: userName } = userDataResult.data;
                const token = jsonwebtoken_1.default.sign({ id }, String(jwtSecret), {
                    expiresIn: Number(jwtExpiresIn) || "1d"
                });
                return response.status(200).json({ id, avatarUrl, userName, token });
            }
            catch (error) {
                if ((0, axios_1.isAxiosError)(error)) {
                    return response.status(500).json({ error: error.message });
                }
                return response.status(500).json({ error: "Internal server error" });
            }
        };
    }
}
exports.AuthController = AuthController;
