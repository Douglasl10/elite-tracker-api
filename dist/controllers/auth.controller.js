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
const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN);
const githubRedirectUri = process.env.GITHUB_REDIRECT_URI;
class AuthController {
    constructor() {
        this.auth = async (req, res) => {
            const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(githubRedirectUri)}&scope=read:user`;
            return res.status(200).json({ redirectUrl });
        };
        this.authCallback = async (req, res) => {
            try {
                const code = req.query.code;
                if (!code)
                    return res.status(400).json({ error: "Code is required" });
                const tokenResponse = await axios_1.default.post("https://github.com/login/oauth/access_token", {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    redirect_uri: githubRedirectUri,
                }, { headers: { Accept: "application/json" } });
                const accessToken = tokenResponse.data.access_token;
                if (!accessToken)
                    return res.status(500).json({ error: "GitHub token error" });
                const userResponse = await axios_1.default.get("https://api.github.com/user", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const { node_id: id } = userResponse.data;
                const token = jsonwebtoken_1.default.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
                return res.redirect(`https://elitetracker.netlify.app/autenticacao?token=${token}`);
            }
            catch (error) {
                if ((0, axios_1.isAxiosError)(error))
                    return res.status(500).json({ error: error.message });
                return res.status(500).json({ error: "Internal error" });
            }
        };
    }
}
exports.AuthController = AuthController;
