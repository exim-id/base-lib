import { path } from "../deps.ts";
import { fileExist } from "./helpers.ts";
import { project_root } from "./paths.ts";

// ==================================================================== //
// ==================================================================== //
//-> Read .env

const env_file_path = path.join(project_root, ".env");
if (await fileExist(env_file_path)) {
  const data = await Deno.readTextFile(env_file_path);
  for (const line of data.split("\n")) {
    const [key, value] = line.split("=");
    if (key && value) Deno.env.set(key.trim(), value.trim());
  }
}

// ==================================================================== //
// ==================================================================== //

const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "local";

export const Server = {
  status: ENVIRONMENT,
  secretKey: Deno.env.get("SECRET_KEY") || "high-secret-key",
  isProduction: String(ENVIRONMENT).includes("production"),
  isDevelopment: String(ENVIRONMENT).includes("development"),
  isLocal: String(ENVIRONMENT).includes("local"),
  port: Number(Deno.env.get("PORT") || "8080"),
  tz: Deno.env.get("TZ") || "Asia/Jakarta",
};

export const SwaggerEnv = {
  SWAGGER_URL: Deno.env.get("SWAGGER_URL") || `localhost:${Server.port}`,

  APP_NAME: Deno.env.get("APP_NAME") || "app name",
  APP_VERSION: Deno.env.get("APP_VERSION") || "1.0.0",
  APP_DESCRIPTION:
    Deno.env.get("APP_DESCRIPTION") || "please complete information in .env",
  APP_SCHEMES: Deno.env.get("APP_SCHEMES")
    ? String(Deno.env.get("APP_SCHEMES")).toLowerCase().split("|")
    : ["http", "https"],
  CONTACT_NAME: Deno.env.get("CONTACT_NAME"),
  CONTACT_EMAIL: Deno.env.get("CONTACT_EMAIL"),
};

export const Mongo = {
  url: Deno.env.get("MONGO_URL") || "mongodb://localhost:27017/exim",
  dbUser: Deno.env.get("MONGO_USER") || "",
  dbPass: Deno.env.get("MONGO_PASSWORD") || "",
  dbName: Deno.env.get("MONGO_NAME") || "exim",
};

export const OTP_EXPIRED_MINUTE = Number(
  Deno.env.get("OTP_EXPIRED_MINUTE") || 3
);

export const Jwt = {
  SECRET_TOKEN: Deno.env.get("JWT_SECRET_TOKEN") || "very-secret-token",
  EXPIRED_TOKEN: Deno.env.get("JWT_EXPIRED_TOKEN") || "7d",
};

export const Reporter = {
  GIT_URL: Deno.env.get("REPORT_GIT_URL"),
  ERROR_URL: Deno.env.get("REPORT_ERROR_URL"),
  BUSINESS_URL: Deno.env.get("REPORT_BUSINESS_URL"),
  BEARER_TOKEN: Deno.env.get("REPORT_BEARER_TOKEN"),
  GROUP_ID: Deno.env.get("REPORT_GROUP_ID"),
};

export const Minio = {
  MINIO_URL: Deno.env.get("MINIO_URL") || "localhost",
  MINIO_PORT: parseInt(Deno.env.get("MINIO_PORT") || "9000"),
  MINIO_SSL: (Deno.env.get("MINIO_SSL") || "false") === "true",
  MINIO_ACCESS_KEY: Deno.env.get("MINIO_ACCESS_KEY") || "username",
  MINIO_SECRET_KEY: Deno.env.get("MINIO_SECRET_KEY") || "password",
};
