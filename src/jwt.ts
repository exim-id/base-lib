import { jsonwebtoken as jwt, Request, Response, uuidV4 } from "../deps.ts";
import { dbConnection, dbTransaction } from "./db.ts";
import { Jwt } from "./env.ts";

export const rbac = async (req: Request, res: Response, roles: string[]) => {
  let token = req.headers.get("Authorization");
  if (!token || !token.startsWith("Bearer")) {
    throw new AuthError("Token not found");
  }
  token = token.replace("Bearer ", "");
  token = await refreshJti(token, "/user/update-password" === req.path);
  const session = await dbConnection(async (db) => {
    const session = JWTdecrypt(token!);
    const user = await db.collection("users").findOne({
      id: session.sub,
      deleted: false,
    });
    if (!user) throw new AuthError("Token not found");
    if (0 < roles.length) {
      const userRoles: string[] = user.roles;
      if (!userRoles.some(roles.includes)) {
        throw new AuthError("Invalid access");
      }
    }
    return session;
  });
  res.locals["user"] = session.sub;
  res.setHeader("Authorization", token);
  return true;
};

export const refreshJti = async (token: string, forcedChange: boolean) => {
  return await dbTransaction(async (db) => {
    let newToken = token;
    let session = JWTdecrypt(newToken);
    const now = Date.now() + (1000 * 60 * 2),
      exp = session.exp + session["created"];
    if (now < exp && !forcedChange) return newToken;
    const tokens = await db.collection("tokens").find({
      sub: session.sub,
      access: session["access"],
    })
      .toArray();
    if (0 === tokens.length) throw new AuthError("Token not found");
    newToken = JWTencrypt(session.sub || "", "" + session["access"]);
    await db.collection("tokens").deleteOne({ jti: session.jti });
    session = JWTdecrypt(newToken);
    await db.collection("tokens").insertOne({
      jti: session.jti,
      sub: session.sub,
      access: session["access"],
    }, { maxTimeMS: spelledTimeToEpoch(Jwt.EXPIRED_TOKEN) });
    return newToken;
  });
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

export class AuthError extends Error {}

export function JWTdecrypt(token: string): jwt.JwtPayload {
  const result = jwt.verify(token, Jwt.SECRET_TOKEN);
  if (typeof result === "string") {
    throw new AuthError("Failed to decrypt");
  }
  return result;
}

export const JWTencrypt = (subject: string, access: string) =>
  jwt.sign({ access, created: Date.now() }, Jwt.SECRET_TOKEN, {
    subject,
    algorithm: "HS512",
    expiresIn: Jwt.EXPIRED_TOKEN,
    jwtid: uuidV4(),
  });
