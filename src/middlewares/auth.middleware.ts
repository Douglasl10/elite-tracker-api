import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../@types/user.type";

function authMiddleware(request: Request, response: Response, next: NextFunction) {
    const authToken = request.headers.authorization;

    if (!authToken) {
        return response.status(401).json({ error: "Token not provided" });
    }

    const [, token] = authToken.split(" ");

    try {
        jwt.verify(token, String(process.env.JWT_SECRET), (error, decoded) => {
            if (error) {
                throw new Error();
            }
            request.user = decoded as User;
            return next();

        })
    } catch (error) {
        return response.status(401).json({ error: "Invalid token" });
    }

}

export default authMiddleware;
