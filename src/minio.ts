import { minio } from "../deps.ts";
import { Minio } from "./env.ts";

export const minioClient = () => new minio.Client({
  endPoint: Minio.MINIO_URL,
  accessKey: Minio.MINIO_ACCESS_KEY, 
  secretKey: Minio.MINIO_SECRET_KEY,   
  useSSL: Minio.MINIO_SSL,
  port: Minio.MINIO_PORT,
});
