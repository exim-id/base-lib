import { JWTencrypt,JWTdecrypt } from "./src/jwt.ts";

const token=JWTencrypt('1','global')
console.log('Token',token)
const session=JWTdecrypt(token)
console.log('Session',session)