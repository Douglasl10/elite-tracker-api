import { Request, Response } from "express";
import axios, { isAxiosError } from "axios";
import jwt from "jsonwebtoken";

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

export class AuthController {
    auth = async (request: Request, response: Response) => {
        const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`

        response.status(200).json({ redirectUrl })
    };

    authCallback = async (request: Request, response: Response) => {
        try {
            const { code } = request.query;

            const accessTokenResult = await axios.post("https://github.com/login/oauth/access_token", {
                client_id: clientId,
                client_secret: clientSecret,
                code,

            },
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            const userDataResult = await axios.get("https://api.github.com/user", {
                headers: {
                    "Authorization": `Bearer ${accessTokenResult.data.access_token}`
                }
            });

            const { node_id: id, avatar_url: avatarUrl, name: userName } = userDataResult.data;

            const token = jwt.sign({ id }, String(jwtSecret), {
                expiresIn: Number(jwtExpiresIn) || "1d"
            }); 

            return response.status(200).json({ id, avatarUrl, userName, token })
        } catch (error) {
            if (isAxiosError(error)) {
                return response.status(500).json({ error: error.message });
            }
            return response.status(500).json({ error: "Internal server error" });
        }
    }
}
