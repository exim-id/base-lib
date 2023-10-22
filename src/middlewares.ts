import {
  AnyZodObject,
  HttpResponse,
  NextFunction,
  Request,
  Response,
  Status,
  ZodError,
} from "../mod.ts";

export default (schema: AnyZodObject) =>
async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map((issue) => ({
        property: issue.path.join("."),
        message: issue.message,
        errorCode: issue.code,
      }));
      const response = HttpResponse.error({
        statusCode: Status.UnprocessableEntity,
        message: "Validation error",
        data: validationErrors,
      });
      return res.setStatus(response.statusCode).json(response);
    } else {
      next(error);
    }
  }
};
