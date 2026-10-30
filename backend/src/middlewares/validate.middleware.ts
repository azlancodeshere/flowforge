
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate = (schema: ZodType): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join(", ");

      next(new ApiError(400, message));
      return;
    }

    next();
  };
};
