import path from "node:path";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import { SUPPORTED_LOCALES } from "@gestion-studio/shared";
import { env } from "./env";

void i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}/{{ns}}.json"),
    },
    fallbackLng: env.locale.defaultLocale,
    preload: [...SUPPORTED_LOCALES],
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "translation",
  });

export const i18nMiddleware = middleware.handle(i18next);
export { i18next };
