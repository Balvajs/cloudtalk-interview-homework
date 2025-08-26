import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { app } from '../../../app.ts';
import { setupTestDatabase } from '../../../test/setup-test-database.ts';

vi.mock(import('../../../db/database.ts'));

describe('Products API', () => {
  beforeAll(async () => {
    const { cleanupTestDatabase } = await setupTestDatabase();

    return cleanupTestDatabase;
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        quantity: 5,
        price: 15.99,
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body).toMatchObject(productData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/products')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toMatchInlineSnapshot(`
        [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received undefined",
            "path": [
              "name",
            ],
          },
          {
            "code": "invalid_type",
            "expected": "number",
            "message": "Invalid input: expected number, received undefined",
            "path": [
              "quantity",
            ],
          },
          {
            "code": "invalid_type",
            "expected": "number",
            "message": "Invalid input: expected number, received undefined",
            "path": [
              "price",
            ],
          },
        ]
      `);
    });

    it('should validate positive quantity', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Invalid Product',
          quantity: -1,
          price: 10,
        })
        .expect(400);

      expect(response.body.errors).toMatchInlineSnapshot(`
        [
          {
            "code": "too_small",
            "inclusive": true,
            "message": "Too small: expected number to be >=0",
            "minimum": 0,
            "origin": "number",
            "path": [
              "quantity",
            ],
          },
        ]
      `);
    });

    it('should validate positive price', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Invalid Product',
          quantity: 5,
          price: -10,
        })
        .expect(400);

      expect(response.body.errors).toMatchInlineSnapshot(`
        [
          {
            "code": "too_small",
            "inclusive": true,
            "message": "Too small: expected number to be >=0",
            "minimum": 0,
            "origin": "number",
            "path": [
              "price",
            ],
          },
        ]
      `);
    });

    it('should validate data types', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Test Product',
          quantity: 'not-a-number',
          price: 'not-a-number',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
