import { Prisma } from "@prisma/client";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export class AppError extends Error {
  readonly statusCode: number;
  readonly fields?: Record<string, string>;

  constructor(statusCode: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.fields = fields;
  }
}

export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) {
        fields[key] = issue.message;
      }
    }
    return res.status(400).json({
      error: {
        message: "Validation failed",
        fields,
      },
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: { message: "Invalid JSON body" },
    });
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    logger.error("Database request failed");
    return res.status(500).json({
      error: { message: "Internal server error" },
    });
  }

  logger.error("Unhandled error");

  return res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: { message: "Not found" },
  });
}
