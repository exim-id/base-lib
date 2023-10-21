// deno-lint-ignore-file no-namespace

import { path } from "../deps.ts";
import { fileExist } from "./helper.ts";
import { project_root } from "./path.ts";

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

export namespace Server {
  export const status = Deno.env.get("ENVIRONMENT") || "local";
  export const secretKey = Deno.env.get("SECRET_KEY") || "high-secret-key";
  export const isProduction = String(status).includes("production");
  export const isDevelopment = String(status).includes("development");
  export const isLocal = String(status).includes("local");
  export const port = Number(Deno.env.get("PORT") || "8080");
  export const tz = Deno.env.get("TZ") || "Asia/Jakarta";
}

export namespace Swagger {
  export const SWAGGER_URL =
    Deno.env.get("SWAGGER_URL") || `localhost:${Server.port}`;

  export const APP_NAME = Deno.env.get("APP_NAME") || "app name";
  export const APP_VERSION = Deno.env.get("APP_VERSION") || "1.0.0";
  export const APP_DESCRIPTION =
    Deno.env.get("APP_DESCRIPTION") || "please complete information in .env";
  export const APP_SCHEMES = Deno.env.get("APP_SCHEMES")
    ? String(Deno.env.get("APP_SCHEMES")).toLowerCase().split("|")
    : ["http", "https"];
  export const CONTACT_NAME = Deno.env.get("CONTACT_NAME");
  export const CONTACT_EMAIL = Deno.env.get("CONTACT_EMAIL");
}

export namespace Mongo {
  export const url =
    Deno.env.get("MONGO_URL") || "mongodb://localhost:27017/exim";
  export const dbUser = Deno.env.get("MONGO_USER") || "";
  export const dbPass = Deno.env.get("MONGO_PASSWORD") || "";
  export const dbName = Deno.env.get("MONGO_NAME") || "exim";
}

export const OTP_EXPIRED_MINUTE = Number(
  Deno.env.get("OTP_EXPIRED_MINUTE") || 3
);

export namespace Jwt {
  export const SECRET_TOKEN =
    Deno.env.get("JWT_SECRET_TOKEN") || "very-secret-token";
  export const EXPIRED_TOKEN = Deno.env.get("JWT_EXPIRED_TOKEN") || "7d";
}

export namespace Reporter {
  export const GIT_URL: any = Deno.env.get("REPORT_GIT_URL");
  export const ERROR_URL: any = Deno.env.get("REPORT_ERROR_URL");
  export const BUSINESS_URL: any = Deno.env.get("REPORT_BUSINESS_URL");
  export const BEARER_TOKEN = Deno.env.get("REPORT_BEARER_TOKEN");
  export const GROUP_ID = Deno.env.get("REPORT_GROUP_ID");
}
