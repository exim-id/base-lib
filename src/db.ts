// deno-lint-ignore-file no-explicit-any

import { mongodb, Mutex } from "../deps.ts";
import { Mongo } from "./env.ts";

export const dbTransaction = async <T>(
  exec = (_: mongodb.Db): Promise<T> => {
    const example: any = true;
    return example;
  },
): Promise<T> => {
  const mu = new Mutex();
  await mu.acquire();
  const cli = cliCreate();
  try {
    await cli.connect();
    const session = cli.startSession();
    try {
      session.startTransaction();
      const result = await exec(cli.db(Mongo.dbName));
      await session.commitTransaction();
      return result;
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

export const dbConnection = async <T>(
  exec = (_: mongodb.Db): Promise<T> => {
    const example: any = true;
    return example;
  },
): Promise<T> => {
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

export const dbPaginate = async (
  collection_name: string,
  show: number,
  page: number,
  query = {},
) => {
  return await dbConnection(async (db) => {
    const collection = db.collection(collection_name);

    const totalDocuments = await collection.countDocuments();
    const totalPage = Math.ceil(totalDocuments / show);

    const data = await collection.find(query)
      .skip((page - 1) * show)
      .limit(show)
      .toArray();

    return {
      data,
      meta: {
        pagination: {
          current_page: page,
          per_page: show,
          total: totalDocuments,
          last_page: totalPage,
        },
      },
    };
  });
};
