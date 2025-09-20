import "dotenv/config";

import express from "express";
import { routes } from "./routes";
import { setupMongo } from "./database";
import cors from "cors";

const app = express();

setupMongo().then(() => {
    app.use(cors({
        origin: "http://localhost:5173"
    }));

    app.use(express.json());

    app.use(routes);

    app.listen(4000, () => console.log("🚀 Server is running on port 4000"));
}).catch((err) => {
    console.error(err.message)
});
