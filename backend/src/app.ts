import path from 'node:path';

import cookieParser from 'cookie-parser';
import express, { json, static as static_, urlencoded } from 'express';
import logger from 'morgan';

import indexRouter from './routes/index.ts';
import usersRouter from './routes/users.ts';

const app = express();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(static_(path.join(import.meta.dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
