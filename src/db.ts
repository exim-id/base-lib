// deno-lint-ignore-file no-explicit-any

import { mongodb, Mutex } from "../deps.ts";
import { Mongo } from "./env.ts";

export const dbTransaction = async <T>(
  exec = (_: mongodb.Db): Promise<T> => {
    const example: any = true;
    return example;
  }
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
  }
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
  query = {},
  show: string | undefined,
  page: string | undefined
) => {
  let use_show = 10;
  if (show) {
    use_show = parseInt(show);
  }
  let use_page = 1;
  if (page) {
    use_page = parseInt(page);
  }

  return await dbConnection(async (db) => {
    const collection = db.collection(collection_name);

    const totalDocuments = await collection.countDocuments();
    const totalPage = Math.ceil(totalDocuments / use_show);

    const data = await collection
      .find(query)
      .skip((use_page - 1) * use_show)
      .limit(use_show)
      .toArray();

    return {
      data,
      meta: {
        pagination: {
          current_page: use_page,
          per_page: use_show,
          total: totalDocuments,
          last_page: totalPage,
        },
      },
    };
  });
};
