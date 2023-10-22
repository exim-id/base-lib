// deno-lint-ignore-file no-explicit-any

import { jsonwebtoken, Request, Response, Status } from "../deps.ts";
import { AuthError } from "./jwt.ts";

interface IData {
  [key: string]: any;
}

interface IPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface ISuccess {
  message: string;
  statusCode: number;
  success: boolean;
  data: IData[] | IData;
  meta: {
    pagination: IPagination;
  };
}
interface ISuccessResponse {
  message?: string;
  statusCode?: number;
  success?: boolean;
  data?: IData[] | IData;
  meta?: {
    pagination: IPagination;
  };
}
const success = (response: ISuccessResponse): ISuccess => {
  const new_response: any = { ...response };
  if (typeof new_response?.message == "undefined") {
    new_response.message = "OK";
  }
  if (typeof new_response?.statusCode == "undefined") {
    new_response.statusCode = Status.OK;
  }
  if (typeof new_response?.success == "undefined") {
    new_response.success = true;
  }
  if (typeof new_response?.data == "undefined") {
    new_response.data = [];
  }
  return new_response;
};

interface IError {
  message: string;
  statusCode: number;
  success: boolean;
  data: IData[] | IData;
}
interface IErrorResponse {
  message?: string;
  statusCode?: number;
  success?: boolean;
  data?: IData[] | IData;
}
const errorResponse = (response: IErrorResponse): IError => {
  const new_response: any = { ...response };
  if (typeof new_response?.message == "undefined") {
    new_response.message = "ERROR";
  }
  if (typeof new_response?.statusCode == "undefined") {
    new_response.statusCode = Status.BadRequest;
  }
  if (typeof new_response?.success == "undefined") {
    new_response.success = false;
  }
  return new_response;
};

// ------------------------------------------------------------------- //
//-> Custom Response

const notFound = (message = "Not Found") => {
  return errorResponse({ message, statusCode: Status.NotFound });
};
const notAuthorized = (message = "Not Authorized") => {
  return errorResponse({ message, statusCode: Status.Unauthorized });
};

const internalServerError = (from: string, error: Error) => {
  console.error(`${from} : ${error.message}\n${error.stack}`);
  return errorResponse({
    message: "internal server error",
    statusCode: Status.InternalServerError,
  });
};

const badRequest = (message = "Bad Request") =>
  errorResponse({ message, statusCode: Status.BadRequest });

export class DataNotFoundError extends Error {}

const opineErrorHandler = (req: Request, res: Response, e: Error) => {
  let responseBody: IError;
  const authErrors = [
    AuthError,
    jsonwebtoken.JsonWebTokenError,
    jsonwebtoken.NotBeforeError,
    jsonwebtoken.TokenExpiredError,
  ];
  const notFoundErrors = [DataNotFoundError];
  const badReqErrors: (typeof Error)[] = [];
  if (authErrors.some((cls) => e instanceof cls)) {
    responseBody = notAuthorized(e.message);
  } else if (notFoundErrors.some((cls) => e instanceof cls)) {
    responseBody = notFound(e.message);
  } else if (badReqErrors.some((cls) => e instanceof cls)) {
    responseBody = badRequest(e.message);
  } else responseBody = internalServerError(`${req.method} ${req.url}`, e);
  res.setStatus(responseBody.statusCode).json(responseBody);
};

export default {
  success,
  error: errorResponse,
  notFound,
  notAuthorized,
  internalServerError,
  badRequest,
  opineErrorHandler,
};
