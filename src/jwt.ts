import { jwt } from "../deps.ts";
import { Jwt } from "./env.ts";

export const JWTdecrypt = (token: string) =>
  jwt.verify(token, Jwt.SECRET_TOKEN);

export const JWTencrypt = (subject: string, access: string) =>
  jwt.sign({ access }, Jwt.SECRET_TOKEN, {
    subject,
    algorithm: "HS512",
    expiresIn: Jwt.EXPIRED_TOKEN,
  });
