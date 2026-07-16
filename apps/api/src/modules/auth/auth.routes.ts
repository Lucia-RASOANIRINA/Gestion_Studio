import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../common/middleware/validate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { authenticate } from "../../common/middleware/authenticate";
import { loginSchema, refreshSchema, twoFactorCodeSchema } from "./auth.validation";
import {
  disable2faHandler,
  enable2faHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  setup2faHandler,
} from "./auth.controller";

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

// Double authentification (TOTP) — nécessite d'être connecté.
authRouter.post("/2fa/setup", authenticate, asyncHandler(setup2faHandler));
authRouter.post("/2fa/enable", authenticate, validateBody(twoFactorCodeSchema), asyncHandler(enable2faHandler));
authRouter.post("/2fa/disable", authenticate, validateBody(twoFactorCodeSchema), asyncHandler(disable2faHandler));
