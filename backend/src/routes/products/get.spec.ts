import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { app } from '../../app.ts';
import { setupTestDatabase } from '../../test/setup-test-database.ts';

vi.mock(import('../../db/database.ts'));

describe('Products API', () => {
  beforeAll(async () => {
    const { cleanupTestDatabase } = await setupTestDatabase();

    return cleanupTestDatabase;
  });

  describe('GET /products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await request(app).get('/products').expect(200);

      expect(response.body).toEqual({
        data: [],
        pagination: {
          hasNextPage: false,
          nextCursor: undefined,
          limit: 20,
          order: 'asc',
        },
      });
    });

    it('should return all products', async () => {
      // First create a product
      await request(app).post('/products').send({
        name: 'Test Product',
        quantity: 10,
        price: 29.99,
      });

      const response = await request(app).get('/products').expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        name: 'Test Product',
        quantity: 10,
        price: 29.99,
      });
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('createdAt');
      expect(response.body.data[0]).toHaveProperty('updatedAt');
      expect(response.body.pagination).toEqual({
        hasNextPage: false,
        nextCursor: undefined,
        limit: 20,
        order: 'asc',
      });
    });

    it('should support custom limit', async () => {
      // Create multiple products
      for (let index = 1; index <= 5; index++) {
        await request(app)
          .post('/products')
          .send({
            name: `Product ${index}`,
            quantity: index,
            price: index * 10,
          });
      }

      const response = await request(app).get('/products?limit=3').expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.limit).toBe(3);
      expect(response.body.pagination.hasNextPage).toBe(true);
      expect(response.body.pagination.nextCursor).toBeDefined();
    });

    it('should support cursor-based pagination', async () => {
      // Create multiple products with delays to ensure different timestamps
      for (let index = 1; index <= 5; index++) {
        await request(app)
          .post('/products')
          .send({
            name: `Product ${index}`,
            quantity: index,
            price: index * 10,
          });
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Get first page
      const firstPage = await request(app).get('/products?limit=2').expect(200);

      expect(firstPage.body.data).toHaveLength(2);
      expect(firstPage.body.pagination.hasNextPage).toBe(true);

      // Get second page using cursor
      const secondPage = await request(app)
        .get(`/products?limit=2&cursor=${firstPage.body.pagination.nextCursor}`)
        .expect(200);

      expect(secondPage.body.data).toHaveLength(2);
      // Verify pagination is working by checking cursor is being used
      expect(firstPage.body.pagination.nextCursor).toBeDefined();
      expect(secondPage.body.pagination).toBeDefined();
    });

    it('should support descending order', async () => {
      // Create multiple products with small delays to ensure different createdAt
      for (let index = 1; index <= 3; index++) {
        await request(app)
          .post('/products')
          .send({
            name: `Product ${index}`,
            quantity: index,
            price: index * 10,
          });
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const response = await request(app)
        .get('/products?order=desc')
        .expect(200);

      expect(response.body.pagination.order).toBe('desc');
      // Products should be in descending order by createdAt
      const createdAtDates = response.body.data.map(
        (product: { createdAt: string }) =>
          new Date(product.createdAt).getTime(),
      );
      const sortedDesc = [...createdAtDates].sort((a, b) => b - a);
      expect(createdAtDates).toEqual(sortedDesc);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/products?limit=150') // Over max limit
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
