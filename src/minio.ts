import { Buffer, minio, Readable } from "../deps.ts";
import { Minio } from "./env.ts";

export const readableToBuffer = (read: Readable) =>
  new Promise<Buffer>((resolve, reject) => {
    let data = Buffer.alloc(0);
    read.on("error", reject);
    read.on("data", (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    read.on("end", () => resolve(data));
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
