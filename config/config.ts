import { Mutex, mongodb } from "../deps.ts"

export const dbTrans = async (exec = async (_: mongodb.Db) => { }) => {
    const mu = new Mutex()
    await mu.acquire()
    const dbUrl = Deno.env.get('DB_URL') || 'mongodb://localhost:27017/exim'
    const dbName = Deno.env.get('DB_NAME') || 'exim'
    const dbUser = Deno.env.get('DB_USER') || ''
    const dbPass = Deno.env.get('DB_PASSWORD') || ''
    const cli = new mongodb.MongoClient(dbUrl, { auth: { password: dbPass, username: dbUser }, family: null, hints: null, localAddress: null, localPort: null, lookup: null })
    try {
        await cli.connect()
        const session = cli.startSession()
        try {
            session.startTransaction()
            await exec(cli.db(dbName))
            await session.commitTransaction()
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
            mu.release()
        }
    } finally {
        await cli.close()
    }
}

export const dbConnection = async (exec = async (_: mongodb.Db) => { }) => {
    const dbUrl = Deno.env.get('DB_URL') || 'mongodb://localhost:27017/exim'
    const dbName = Deno.env.get('DB_NAME') || 'exim'
    const dbUser = Deno.env.get('DB_USER') || ''
    const dbPass = Deno.env.get('DB_PASSWORD') || ''
    const cli = new mongodb.MongoClient(dbUrl, { auth: { password: dbPass, username: dbUser }, family: null, hints: null, localAddress: null, localPort: null, lookup: null })
    try {
        await cli.connect()
        await exec(cli.db(dbName))
    } finally {
        await cli.close()
    }
}