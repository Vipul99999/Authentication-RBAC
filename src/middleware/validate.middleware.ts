import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./error.middleware";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return next(new AppError(errors.join(", "), 400));
    }

    req.body = result.data; // sanitized data
    next();
  };