import { swaggerAutogen } from "../deps.ts";
import { modules_dir, swagger_json_file } from "./path.ts";
import { Swagger } from "./env.ts";

export const createSwaggerJson = async () => {
  const result: any = await swaggerAutogen(swagger_json_file, [
    `${modules_dir}/index.ts`,
  ], doc);
  if (!result.success) return false;
  await Deno.remove(swagger_json_file, { recursive: true });
  return result.data;
};

const doc = {
  info: {
    title: Swagger.APP_NAME,
    version: Swagger.APP_VERSION,
    description: Swagger.APP_DESCRIPTION,
    termsOfService: "http://swagger.io/terms/",
    contact: {
      name: Swagger.CONTACT_NAME,
      email: Swagger.CONTACT_EMAIL,
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: Swagger.SWAGGER_URL,
  basePath: "/",
  schemes: Swagger.APP_SCHEMES,
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
