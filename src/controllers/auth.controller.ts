import { Request, Response } from "express";
import axios, { isAxiosError } from "axios";
import jwt, { SignOptions, Secret } from "jsonwebtoken";

const clientId = process.env.GITHUB_CLIENT_ID!;
const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
const jwtSecret: Secret = process.env.JWT_SECRET as string;
const jwtExpiresIn: SignOptions["expiresIn"] = Number(process.env.JWT_EXPIRES_IN!);
const githubRedirectUri = process.env.GITHUB_REDIRECT_URI!;

export class AuthController {
  auth = async (req: Request, res: Response) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      githubRedirectUri
    )}&scope=read:user`;

    return res.status(200).json({ redirectUrl });
  };

  authCallback = async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      if (!code) return res.status(400).json({ error: "Code is required" });

      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: githubRedirectUri,
        },
        { headers: { Accept: "application/json" } }
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) return res.status(500).json({ error: "GitHub token error" });

      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { node_id: id } = userResponse.data;

      const token = jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });

      return res.redirect(`https://elitetracker.netlify.app/autenticacao?token=${token}`);
    } catch (error) {
      if (isAxiosError(error)) return res.status(500).json({ error: error.message });
      return res.status(500).json({ error: "Internal error" });
    }
  };
}
