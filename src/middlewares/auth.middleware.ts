import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../@types/user.type";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
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
    const decoded = jwt.verify(token, secret) as User;

    // adiciona dados do usuário no request
    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default authMiddleware;
