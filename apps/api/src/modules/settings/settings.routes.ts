import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { validateBody } from "../../common/middleware/validate";
import { getProfileHandler, updateProfileHandler } from "./settings.controller";
import { updateProfileSchema } from "./settings.validation";

export const settingsRouter = Router();

settingsRouter.use(authenticate);

// Profil & préférences personnelles (langue, thème) : accessibles à tout
// utilisateur authentifié, indépendamment de la permission SETTINGS.
settingsRouter.get("/me", asyncHandler(getProfileHandler));
settingsRouter.patch("/me", validateBody(updateProfileSchema), asyncHandler(updateProfileHandler));
