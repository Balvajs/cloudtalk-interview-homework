import { Router } from 'express';

import { getProductsRouter } from './get.ts';
import { putDecreaseStockRouter } from './id/decrease-stock/put.ts';
import { deleteProductRouter } from './id/delete.ts';
import { getProductRouter } from './id/get.ts';
import { putIncreaseStockRouter } from './id/increase-stock/put.ts';
import { postProductRouter } from './id/post.ts';
import { putProductRouter } from './id/put.ts';

export const productsRouter = Router();
productsRouter
  .use(getProductsRouter)
  .use(deleteProductRouter)
  .use(getProductRouter)
  .use(postProductRouter)
  .use(putProductRouter)
  .use(putIncreaseStockRouter)
  .use(putDecreaseStockRouter);
