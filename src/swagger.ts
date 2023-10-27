// deno-lint-ignore-file no-explicit-any

import { Application, Status } from "../deps.ts";
import {
  main_js,
  swagger_html,
  swagger_ui_bundle_js,
  swagger_ui_standalone_preset_js,
} from "../file_cache.ts";
import { modules_dir, swagger_json_file } from "./paths.ts";
import { Server, SwaggerEnv } from "./env.ts";
import { fileExist } from "./helpers.ts";

import swaggerAutogen from "npm:swagger-autogen@2.23.1";

export const createSwaggerJson = async () => {
  if (Server.isProduction) return false;

  if (await fileExist(`${modules_dir}/index.ts`)) {
    const result: any = await swaggerAutogen(swagger_json_file, [
      `${modules_dir}/index.ts`,
    ], doc);
    if (!result.success) return false;
    return result.data;
  }

  if (await fileExist(swagger_json_file)) {
    const swagger_json_text = await Deno.readTextFile(swagger_json_file);
    return JSON.parse(swagger_json_text);
  }

  return false;
};

export const doc = {
  info: {
    title: SwaggerEnv.APP_NAME,
    version: SwaggerEnv.APP_VERSION,
    description: SwaggerEnv.APP_DESCRIPTION,
    termsOfService: "http://swagger.io/terms/",
    contact: {
      name: SwaggerEnv.CONTACT_NAME,
      email: SwaggerEnv.CONTACT_EMAIL,
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: SwaggerEnv.SWAGGER_URL,
  basePath: "/",
  schemes: SwaggerEnv.APP_SCHEMES,
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    // {
    //   name: "Auth",
    // },
  ],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "Enter your bearer token in the format **Bearer &lt;token>**",
    },
  },
  definitions: {
    only_message: {
      message: "string",
    },
  },
  components: {}, // by default: empty object (OpenAPI 3.x)
};

export const route = async (app: Application) => {
  const swagger_json = await createSwaggerJson();
  if (swagger_json) {
    app.get("/swagger.json", (_, res) => res.json(swagger_json));

    app.get("/swagger", (_, res) => res.send(swagger_html));
    app.get("/cache/:file", (req, res) => {
      const { file } = req.params;
      res.set("content-type", "text/javascript");
      if (file == "main.js") return res.send(main_js);
      if (file == "swagger-ui-bundle.js") return res.send(swagger_ui_bundle_js);
      if (file == "swagger-ui-standalone-preset.js") {
        return res.send(swagger_ui_standalone_preset_js);
      }
      return res.status(Status.NotFound).send("not found...");
    });
  }
};
