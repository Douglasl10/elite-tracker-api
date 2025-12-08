import { Router } from "express";
import packageJson from "../package.json";
import { HabitsController } from "./controllers/habits.controller";
import { FocusTimeController } from "./controllers/focus-time.controller";
import { AuthController } from "./controllers/auth.controller";
import authMiddleware from "./middlewares/auth.middleware";

export const routes = Router();

const habitsController = new HabitsController();
const focusTimeController = new FocusTimeController();
const authController = new AuthController();

routes.get("/", (request, response) => {
    const { name, description, version } = packageJson;

    return response.status(200).json({ name, description, version });
})

routes.use(authMiddleware);

routes.get("/auth", (request, response) => authController.auth(request, response));

routes.get("/auth/callback", (request, response) => authController.authCallback(request, response));

routes.post("/habits", (request, response) => habitsController.store(request, response));

routes.get("/habits",  (request, response) => habitsController.index(request, response));

routes.delete("/habits/:id", (request, response) => habitsController.remove(request, response));

routes.get("/habits/:id/metrics", (request, response) => habitsController.metrics(request, response));

routes.patch("/habits/:id/toggle", (request, response) => habitsController.toggle(request, response));

routes.post("/focus-time", (request, response) => focusTimeController.store(request, response));

routes.get("/focus-time/metrics", (request, response) => focusTimeController.metricsByMonth(request, response));

routes.get("/focus-time", (request, response) => focusTimeController.index(request, response));



