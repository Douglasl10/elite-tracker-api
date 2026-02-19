import "dotenv/config";

import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { setupMongo } from "./database";

const app = express();
const PORT = process.env.PORT || 4000;

setupMongo()
  .then(() => {
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);

          const allowed =
            origin.startsWith("http://localhost") ||
            origin.includes("netlify.app") ||
            origin.includes("vercel.app");

          if (allowed) {
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
