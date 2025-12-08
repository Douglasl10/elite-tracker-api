import { Request, Response } from "express";
import axios, { isAxiosError } from "axios";
import jwt from "jsonwebtoken";

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const jwtSecret = process.env.JWT_SECRET; // pode ser undefined em dev, vamos validar
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";
const githubRedirectUri = process.env.GITHUB_REDIRECT_URI; // certifique-se de setar isso

export class AuthController {
  auth = async (request: Request, response: Response) => {
    if (!clientId) {
      return response.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }

    // inclui redirect_uri para garantir retorno correto do GitHub
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(githubRedirectUri ?? "")}&scope=read:user`;

    return response.status(200).json({ redirectUrl });
  };

  authCallback = async (request: Request, response: Response) => {
    try {
      const code = String(request.query.code ?? "");

      if (!code) {
        return response.status(400).json({ error: "Code is required" });
      }

      // troca code por access_token
      const accessTokenResult = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: githubRedirectUri,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const accessToken = accessTokenResult.data?.access_token;
      if (!accessToken) {
        return response.status(500).json({ error: "Failed to obtain access token" });
      }

      // busca dados do usuário no GitHub
      const userDataResult = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });

      const { node_id: id, avatar_url: avatarUrl, name } = userDataResult.data;

      if (!jwtSecret) {
        return response.status(500).json({ error: "JWT_SECRET not configured" });
      }

      // jwt.sign espera jwt.Secret; jwtExpiresIn deve ser string ou number (p.ex. "1d")
      const token = jwt.sign({ id }, String(jwtSecret), {
                expiresIn: Number(jwtExpiresIn) || "1d"
            });

      // Retornar nome como `name` (consistente com o front)
      return response.status(200).json({ id, name, avatarUrl, token });
    } catch (error) {
      if (isAxiosError(error)) {
        return response.status(500).json({ error: error.message });
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  };
}
