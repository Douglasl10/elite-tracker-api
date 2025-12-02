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
        origin: "http://localhost:3000",
        credentials: true,
    }));
    mongoose.connect(process.env.MONGO_URL!);

    app.use(express.json());

    app.use(routes);

    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
}).catch((err) => {
    console.error(err.message);
    process.exit(1);
});
