import { Request, Response } from "express";
import axios, { isAxiosError } from "axios";
import jwt, { SignOptions, Secret } from "jsonwebtoken";

const clientId = process.env.GITHUB_CLIENT_ID!;
const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
const githubRedirectUri = process.env.GITHUB_REDIRECT_URI!;

const jwtSecret: Secret = process.env.JWT_SECRET!;
const jwtExpiresIn: SignOptions["expiresIn"] =
  process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

export class AuthController {
  // 1️⃣ Retorna a URL de login do GitHub
  auth = async (req: Request, res: Response) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      githubRedirectUri
    )}&scope=read:user`;

    return res.status(200).json({ redirectUrl });
  };

  // 2️⃣ Callback do GitHub
  authCallback = async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;

      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      // 🔹 Troca o code por access_token
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: githubRedirectUri,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        console.error("GitHub token response:", tokenResponse.data);
        return res.status(500).json({ error: "GitHub token error" });
      }

      // 🔹 Busca dados do usuário no GitHub
      const userResponse = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { node_id: id } = userResponse.data;

      // 🔹 Gera JWT da aplicação
      const token = jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn,
      });

      // 🔹 Redireciona para o front com o token
      return res.redirect(
        `https://elite-tracker.netlify.app/auth?token=${token}`
      );
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        return res.status(500).json({ error: "GitHub OAuth error" });
      }

      console.error("Auth callback error:", error);
      return res.status(500).json({ error: "Internal error" });
    }
  };
  
}
