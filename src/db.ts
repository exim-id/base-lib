// deno-lint-ignore-file no-explicit-any

import { mongodb, mongoose, Mutex } from "../deps.ts";
import { Mongo } from "./env.ts";

export const dbTransaction = async <T>(
  exec = (_: mongodb.Db): Promise<T> => {
    const example: any = true;
    return example;
  },
): Promise<T> => {
  const mu = new Mutex();
  await mu.acquire();
  const cli = dbCliCreate();
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
  const cli = dbCliCreate();
  try {
    await cli.connect();
    return await exec(cli.db(Mongo.dbName));
  } finally {
    await cli.close();
  }
};

const dbCliCreate = () => {
  const localAddress = String(Mongo.url).split("//")[1].split(":")[0]
  return new mongodb.MongoClient(
    Mongo.url,
    {
      auth: { password: Mongo.dbPass, username: Mongo.dbUser },
      family: 6,
      hints: 0,
    },
  );
};

export const dbPaginate = async (
  aggr: (_: mongodb.Db) => mongodb.Collection<mongodb.BSON.Document>,
  query: mongodb.Filter<mongodb.BSON.Document>,
  show: string | undefined,
  page: string | undefined,
  sort?: mongodb.FindOptions<mongodb.BSON.Document> | undefined,
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
    const collection = aggr(db);

    const totalDocuments = await collection.countDocuments(query, sort);
    const totalPage = Math.ceil(totalDocuments / use_show);

    const data = await collection
      .find(query, sort)
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

// ========================================================================================
// ========================================================================================
// ========================================================================================

export const mongooseConnection = async <T>(
  exec: (_: typeof mongoose) => Promise<T>,
) => {
  const cli = await mongooseCliCreate();
  try {
    return await exec(cli);
  } finally {
    await cli.connection.close();
  }
};

export const mongooseTransaction = async <T>(
  exec: (_: typeof mongoose) => Promise<T>,
) => {
  const mu = new Mutex();
  await mu.acquire();
  const cli = await mongooseCliCreate();
  try {
    const session = await cli.startSession();
    try {
      const result = await exec(cli);
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
    await cli.connection.close();
  }
};

const mongooseCliCreate = () =>
  mongoose.connect(Mongo.url, {
    auth: { username: Mongo.dbUser, password: Mongo.dbPass },
    dbName: Mongo.dbName,
  });

export interface Paginated<T> {
  page: number;
  size: number;
  pageCount: number;
  datas: T[] | T;
}

export const mongoosePaginate = async <ID, MODEL>(
  show?: string,
  page?: string,
  idsGetter = (_: typeof mongoose): Promise<ID[]> => new Promise((_, __) => {}),
  modelsGetter = (_: ID[], __: typeof mongoose): Promise<MODEL[]> =>
    new Promise((_, __) => {}),
): Promise<Paginated<MODEL>> => {
  let use_show = 10;
  if (show) {
    use_show = parseInt(show, 10);
  }
  let use_page = 1;
  if (page) {
    use_page = parseInt(page, 10);
  }
  return await mongooseConnection(async (db) => {
    let ids = await idsGetter(db);
    const count = Math.ceil(ids.length / use_show);
    ids = ids.slice(use_show * (use_page - 1), use_page * use_show);
    const models = await modelsGetter(ids, db);
    return { page: use_page, size: use_show, pageCount: count, datas: models };
  });
};

export const insertDocument = async (
  Model: any,
  filter: object,
  document: object,
) => {
  const isDocExist = await Model.findOne(filter);
  if (isDocExist) {
    return isDocExist;
  }
  return await Model.create(document);
};
