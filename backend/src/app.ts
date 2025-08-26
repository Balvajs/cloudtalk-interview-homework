import path from 'node:path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, static as static_, urlencoded } from 'express';
import logger from 'morgan';

import { zodErrorHandler } from './middlewares/zod-error-handler.ts';
import { productsRouter } from './routes/products/index.ts';

export const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'http://cloudtalk.io'
        : 'http://localhost:4200',
  }),
);
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(static_(path.join(import.meta.dirname, '../public')));

app.use('/products', productsRouter);

app.use(zodErrorHandler);
