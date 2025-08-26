import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../../../app.ts';
import { setupTestDatabase } from '../../../../test/setup-test-database.ts';

vi.mock(import('../../../../db/database.ts'));

describe('Products API', () => {
  beforeAll(async () => {
    const { cleanupTestDatabase } = await setupTestDatabase();

    return cleanupTestDatabase;
  });

  describe('PUT /products/:id/decrease-stock', () => {
    let productId: string;

    beforeEach(async () => {
      const response = await request(app).post('/products').send({
        name: 'Stock Test Product',
        quantity: 10,
        price: 25.99,
      });
      console.log(response.body);
      productId = response.body.id;
    });

    it('should decrease stock by 1 when no amount is specified', async () => {
      const response = await request(app)
        .put(`/products/${productId}/decrease-stock`)
        .send({})
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Stock Test Product',
        quantity: 9, // 10 - 1
        price: 25.99,
      });
    });

    it('should decrease stock by specified amount', async () => {
      const response = await request(app)
        .put(`/products/${productId}/decrease-stock`)
        .send({ amount: 3 })
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Stock Test Product',
        quantity: 7, // 10 - 3
        price: 25.99,
      });
    });

    it('should not allow stock to go negative', async () => {
      // Try to decrease by more than available stock
      const response = await request(app)
        .put(`/products/${productId}/decrease-stock`)
        .send({ amount: 15 })
        .expect(200);

      // Should return the product unchanged due to constraint
      expect(response.body).toMatchObject({
        id: productId,
        name: 'Stock Test Product',
        quantity: 10, // Original quantity, unchanged
        price: 25.99,
      });
    });

    it('should handle decreasing stock to exactly zero', async () => {
      const response = await request(app)
        .put(`/products/${productId}/decrease-stock`)
        .send({ amount: 10 })
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Stock Test Product',
        quantity: 0, // 10 - 10
        price: 25.99,
      });
    });

    it('should validate that amount is a positive number', async () => {
      const response = await request(app)
        .put(`/products/${productId}/decrease-stock`)
        .send({ amount: 0 })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          code: 'too_small',
          minimum: 1,
          path: ['amount'],
        }),
      );
    });

    it('should validate that amount is not negative', async () => {
      const response = await request(app)
        .put(`/products/${productId}/decrease-stock`)
        .send({ amount: -1 })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          code: 'too_small',
          minimum: 1,
          path: ['amount'],
        }),
      );
    });

    it('should validate that ID is UUID', async () => {
      const nonUuidId = 'non-uuid-id';
      const response = await request(app)
        .put(`/products/${nonUuidId}/decrease-stock`)
        .send({ amount: 1 })
        .expect(400);

      expect(response.body.errors).toMatchInlineSnapshot(`
        [
          {
            "code": "invalid_format",
            "format": "guid",
            "message": "Invalid GUID",
            "origin": "string",
            "path": [
              "id",
            ],
            "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/",
          },
        ]
      `);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .put(`/products/${fakeId}/decrease-stock`)
        .send({ amount: 1 })
        .expect(404);

      expect(response.body).toEqual({
        error: `Product with ID ${fakeId} not found`,
      });
    });
  });
});
