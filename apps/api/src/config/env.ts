import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:4200",
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "change-me-access-secret"),
    refreshSecret: required("JWT_REFRESH_SECRET", "change-me-refresh-secret"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  locale: {
    defaultTimezone: process.env.DEFAULT_TIMEZONE ?? "Indian/Antananarivo",
    defaultCurrency: process.env.DEFAULT_CURRENCY ?? "MGA",
    defaultLocale: process.env.DEFAULT_LOCALE ?? "fr",
  },
};
