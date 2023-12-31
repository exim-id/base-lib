import { base64, CryptoJS } from "../deps.ts";

import { Server } from "./env.ts";

export async function asyncIterableToArray<T>(iter: AsyncIterable<T>) {
  const array: T[] = [];
  for await (const data of iter) array.push(data);
  return array;
}

export function iterableToArray<T>(iter: Iterable<T>) {
  const array: T[] = [];
  for (const data of iter) array.push(data);
  return array;
}

export const isStringBlank = (s: string | null | undefined) => {
  if (!s) return true;
  if (s.length === 0) return true;
  const sa = s.split("");
  return [" ", "-", "_", "0"].some((s) => sa.every((v) => v === s));
};

const reverse_secret_key = String(Server.secretKey)
  .split("")
  .reverse()
  .join(
    "",
  );

const td = new TextDecoder();

export function encode(text: string): string {
  // AES256
  const cipher = CryptoJS.AES.encrypt(text, Server.secretKey);
  const layer_1 = cipher.toString();

  // TripleDES
  const layer_2 = CryptoJS.TripleDES.encrypt(layer_1, reverse_secret_key)
    .toString();

  // BASE64
  const last_layer = base64.encodeBase64(layer_2);
  return last_layer;
}

export function decode(encrypted: string): string | false {
  // BASE64
  const last_layer = td.decode(base64.decodeBase64(encrypted));

  // TripleDES
  const bytes = CryptoJS.TripleDES.decrypt(last_layer, reverse_secret_key);
  const layer_2 = bytes.toString(CryptoJS.enc.Utf8);

  // AES256
  const cipher = CryptoJS.AES.decrypt(layer_2, Server.secretKey);
  if (!cipher) {
    return false;
  }
  const layer_1 = cipher.toString(CryptoJS.enc.Utf8);

  return layer_1;
}

export const hashing = (value: string) => {
  const result = CryptoJS.MD5(value);
  return result.toString(CryptoJS.enc.Base64);
};
