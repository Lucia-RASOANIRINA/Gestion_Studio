import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../common/middleware/validate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { loginSchema, refreshSchema } from "./auth.validation";
import { loginHandler, logoutHandler, refreshHandler } from "./auth.controller";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post("/login", authRateLimit, validateBody(loginSchema), asyncHandler(loginHandler));
authRouter.post("/refresh", authRateLimit, validateBody(refreshSchema), asyncHandler(refreshHandler));
authRouter.post("/logout", validateBody(refreshSchema), asyncHandler(logoutHandler));
