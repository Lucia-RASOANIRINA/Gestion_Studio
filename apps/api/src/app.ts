import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { i18nMiddleware } from "./config/i18n";
import { errorHandler, notFoundHandler } from "./common/middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { clientsRouter } from "./modules/clients/clients.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { planningRouter } from "./modules/planning/planning.routes";
import { resourcesRouter } from "./modules/resources/resources.routes";
import { studiosRouter } from "./modules/studios/studios.routes";
import { hrRouter } from "./modules/hr/hr.routes";
import { notificationsRouter } from "./modules/notifications/notifications.routes";
import { billingRouter } from "./modules/billing/billing.routes";
import { financeRouter } from "./modules/finance/finance.routes";
import { reportingRouter } from "./modules/reporting/reporting.routes";
import { settingsRouter } from "./modules/settings/settings.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(i18nMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: env.nodeEnv });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/planning", planningRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/studios", studiosRouter);
app.use("/api/hr", hrRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/billing", billingRouter);
app.use("/api/finance", financeRouter);
app.use("/api/reporting", reportingRouter);
app.use("/api/settings", settingsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
