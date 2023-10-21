import { jwt } from '../deps.ts'

const secret = Deno.env.get('SECRET') || 'everythinkwhatyouwant'

export const decrypt = (token: string) => jwt.verify(token, secret)

export const encrypt = (subject: string, access: string) => jwt.sign({ access }, secret, { subject, algorithm: 'HS512', expiresIn: Date.now() + (1000 * 8 * 60) })