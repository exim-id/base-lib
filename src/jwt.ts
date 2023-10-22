import { jsonwebtoken as jwt, Request, Response } from "../deps.ts";
import { dbTrans } from "./db.ts";
import { Jwt } from "./env.ts";

export const refreshTokenExpress = async (
  req: Request,
  res: Response,
) => {
  let token = req.headers.get("authorization");
  if (!token) throw new TokenNotFoundError("Token not found");
  if (!token.startsWith("Bearer ")) {
    throw new TokenNotFoundError("Invalid token format");
  }
  token = token.replace("Bearer ", "");
  if (0 === token.length) throw new TokenNotFoundError("Token not found");
  token = await refreshToken(token.replace("Bearer ", ""));
  res.setHeader("Authorization", token);
};

export const refreshToken = async (token: string) => {
  let newToken = token;
  await dbTrans(async (db) => {
    const tokens = await db.collection("tokens").find({ token }).toArray();
    if (0 === tokens.length) throw new TokenNotFoundError("Token not found");
    const session = JWTdecrypt(newToken);
    newToken = JWTencrypt(session.sub || "", "" + session["access"]);
    await db.collection("tokens").deleteOne({ token });
    await db.collection("tokens").insertOne({
      token: newToken,
      sub: session.sub,
      access: session["access"],
    }, { maxTimeMS: spelledTimeToEpoch(Jwt.EXPIRED_TOKEN) });
  });
  return newToken;
};

export const spelledTimeToEpoch = (time: string) => {
  const newTime = time.replaceAll(" ", "").toLowerCase();
  if (newTime.endsWith("ms")) {
    return Date.now() + parseInt(newTime.replaceAll("ms", ""));
  }
  if (newTime.endsWith("s")) {
    return Date.now() + (parseInt(newTime.replaceAll("s", "")) * 1000);
  }
  if (newTime.endsWith("m")) {
    return Date.now() + (parseInt(newTime.replaceAll("s", "")) * 1000 * 60);
  }
  if (newTime.endsWith("h")) {
    return Date.now() +
      (parseInt(newTime.replaceAll("h", "")) * 1000 * 60 * 60);
  }
  if (newTime.endsWith("d")) {
    return Date.now() +
      (parseInt(newTime.replaceAll("d", "")) * 1000 * 60 * 60 * 24);
  }
  return Date.now();
};

export class TokenNotFoundError extends Error {}

export function JWTdecrypt(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, Jwt.SECRET_TOKEN);
}

export const JWTencrypt = (subject: string, access: string) =>
  jwt.sign({ access }, Jwt.SECRET_TOKEN, {
    subject,
    algorithm: "HS512",
    expiresIn: Jwt.EXPIRED_TOKEN,
  });
