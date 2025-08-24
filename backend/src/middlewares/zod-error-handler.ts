import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const zodErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      errors: 'errors' in error ? error.errors : error.message,
    });
  }
  next(error);
};
