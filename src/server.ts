import "dotenv/config";

import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { setupMongo } from "./database";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://elitetracker.netlify.app",
  "https://elitetracker-front-eight.vercel.app",
];

setupMongo()
  .then(() => {
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
      })
    );

    app.use(express.json());
    app.use("/api", routes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });
