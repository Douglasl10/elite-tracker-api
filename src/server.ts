import "dotenv/config";

import express from "express";
import { routes } from "./routes";
import { setupMongo } from "./database";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 4000;

setupMongo().then(() => {
    app.use(cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://dashing-rolypoly-42afbe.netlify.app",
            "https://elitetracker.netlify.app"
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }));

    app.options("*", cors());

    app.use(express.json());

    app.use("/api", routes);


    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
}).catch((err) => {
    console.error(err.message);
    process.exit(1);
});
