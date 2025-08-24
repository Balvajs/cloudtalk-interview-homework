import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../app.ts';
import { setupTestDatabase } from '../test/setup-test-database.ts';

vi.mock(import('../db/database.ts'));

describe('Products API', () => {
  beforeAll(async () => {
    const { cleanupTestDatabase } = await setupTestDatabase();

    return cleanupTestDatabase;
  });

  describe('GET /products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await request(app).get('/products').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all products', async () => {
      // First create a product
      await request(app).post('/products').send({
        name: 'Test Product',
        quantity: 10,
        price: 29.99,
      });

      const response = await request(app).get('/products').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Test Product',
        quantity: 10,
        price: 29.99,
      });
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by ID', async () => {
      const productData = {
        name: 'Test Product',
        quantity: 10,
        price: 29.99,
      };
      const productResponse = await request(app)
        .post('/products')
        .send(productData);

      const productId = productResponse.body.id;

      const getResponse = await request(app)
        .get(`/products/${productId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject(productData);
      expect(getResponse.body).toHaveProperty('id', productId);
      expect(getResponse.body).toHaveProperty('createdAt');
      expect(getResponse.body).toHaveProperty('updatedAt');
    });

    it('should validate that ID is UUID', async () => {
      const nonUuidId = 'non-uuid-id';
      const response = await request(app)
        .get(`/products/${nonUuidId}`)
        .expect(400);
      expect(response.body.errors).toMatchInlineSnapshot(`
        [
          {
            "code": "invalid_format",
            "format": "uuid",
            "message": "Invalid UUID",
            "origin": "string",
            "path": [
              "id",
            ],
            "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/",
          },
        ]
      `);
    });

    it('should return 404 for non-existing product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app).get(`/products/${fakeId}`).expect(404);
    });
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

  describe('PUT /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const response = await request(app).post('/products').send({
        name: 'Original Product',
        quantity: 10,
        price: 20,
      });
      productId = response.body.id;
    });

    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        quantity: 15,
        price: 25,
      };

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updateData);
      expect(response.body.id).toBe(productId);
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(response.body.createdAt).getTime(),
      );
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/products/${productId}`)
        .send({ name: 'Partially Updated' })
        .expect(200);

      expect(response.body.name).toBe('Partially Updated');
      expect(response.body.quantity).toBe(10); // Original value
      expect(response.body.price).toBe(20); // Original value
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .put(`/products/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toEqual({
        error: `Product with ID ${fakeId} not found`,
      });
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const response = await request(app).post('/products').send({
        name: 'Product to Delete',
        quantity: 5,
        price: 10,
      });
      productId = response.body.id;
    });

    it('should delete an existing product', async () => {
      const response = await request(app)
        .delete(`/products/${productId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Product to Delete',
        quantity: 5,
        price: 10,
      });

      // Verify product is deleted
      await request(app).get(`/products/${productId}`).expect(404);
    });

    it('should validate that ID is UUID', async () => {
      const nonUuidId = 'non-uuid-id';
      const response = await request(app)
        .delete(`/products/${nonUuidId}`)
        .expect(400);
      expect(response.body.errors).toMatchInlineSnapshot(`
        [
          {
            "code": "invalid_format",
            "format": "uuid",
            "message": "Invalid UUID",
            "origin": "string",
            "path": [
              "id",
            ],
            "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/",
          },
        ]
      `);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .delete(`/products/${fakeId}`)
        .expect(404);

      expect(response.body).toEqual({
        error: `Product with ID ${fakeId} not found`,
      });
    });
  });
});
