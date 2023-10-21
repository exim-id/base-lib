import { path } from "../deps.ts";

export const __filename = new URL("", import.meta.url).pathname;

export const project_root = Deno.cwd();

export const modules_dir = path.join(project_root, "src/modules");
export const app_file = path.join(project_root, "run.cs");

export const swagger_json_file = path.join(project_root, "swagger.json");
