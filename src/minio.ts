import { Readable } from "https://deno.land/std@0.177.0/node/stream.ts";
import { minio } from "../deps.ts";
import { Minio } from "./env.ts";

export const readableToBuffer = (read: Readable) =>
  new Promise((resolve, reject) => {
    let data = global.Buffer.alloc(0);
    read.on("error", reject);
  });

export const minioClient = async () => {
  const cli = new minio.Client({
    endPoint: Minio.MINIO_URL,
    accessKey: Minio.MINIO_ACCESS_KEY,
    secretKey: Minio.MINIO_SECRET_KEY,
    useSSL: Minio.MINIO_SSL,
    port: Minio.MINIO_PORT,
  });
  if (!await cli.bucketExists(Minio.MINIO_BUCKET)) {
    await cli.makeBucket(Minio.MINIO_BUCKET);
  }
  return cli;
};
