import { Mutex, mongodb } from "../deps.ts";
import { Mongo } from "./env.ts";

export const dbTrans = async (exec = async (_: mongodb.Db) => {}) => {
  const mu = new Mutex();
  await mu.acquire();
  const cli = cliCreate();
  try {
    await cli.connect();
    const session = cli.startSession();
    try {
      session.startTransaction();
      await exec(cli.db(Mongo.dbName));
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
      mu.release();
    }
  } finally {
    await cli.close();
  }
};

export const dbConnection = async (exec = async (_: mongodb.Db) => {}) => {
  const cli = cliCreate();
  try {
    await cli.connect();
    return await exec(cli.db(Mongo.dbName));
  } finally {
    await cli.close();
  }
};

const cliCreate = () => {
  return new mongodb.MongoClient(Mongo.url, {
    auth: { password: Mongo.dbPass, username: Mongo.dbUser },
    family: null,
    hints: null,
    localAddress: null,
    localPort: null,
    lookup: null,
  });
};
