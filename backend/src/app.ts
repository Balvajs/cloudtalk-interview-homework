import path from 'node:path';

import cookieParser from 'cookie-parser';
import express, { json, static as static_, urlencoded } from 'express';
import logger from 'morgan';

import { zodErrorHandler } from './middlewares/zod-error-handler.ts';
import { productsRouter } from './routes/products.ts';

const app = express();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(static_(path.join(import.meta.dirname, '../public')));

app.use('/products', productsRouter);

app.use(zodErrorHandler);

export default app;
