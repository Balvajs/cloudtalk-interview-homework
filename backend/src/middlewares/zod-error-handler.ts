import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const zodErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      errors: error.issues,
    });
  }

  console.error(error);

  next(error);
};
