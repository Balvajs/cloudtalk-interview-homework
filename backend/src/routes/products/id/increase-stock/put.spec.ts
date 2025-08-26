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

  describe('PUT /products/:id/increase-stock', () => {
    let productId: string;

    beforeEach(async () => {
      const response = await request(app).post('/products').send({
        name: 'Stock Test Product',
        quantity: 10,
        price: 25.99,
      });
      productId = response.body.id;
    });

    it('should increase stock by 1 when no amount is specified', async () => {
      const response = await request(app)
        .put(`/products/${productId}/increase-stock`)
        .send({})
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Stock Test Product',
        quantity: 11, // 10 + 1
        price: 25.99,
      });
    });

    it('should increase stock by specified amount', async () => {
      const response = await request(app)
        .put(`/products/${productId}/increase-stock`)
        .send({ amount: 5 })
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Stock Test Product',
        quantity: 15, // 10 + 5
        price: 25.99,
      });
    });

    it('should validate that amount is a positive number', async () => {
      const response = await request(app)
        .put(`/products/${productId}/increase-stock`)
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
        .put(`/products/${productId}/increase-stock`)
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
        .put(`/products/${nonUuidId}/increase-stock`)
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
        .put(`/products/${fakeId}/increase-stock`)
        .send({ amount: 1 })
        .expect(404);

      expect(response.body).toEqual({
        error: `Product with ID ${fakeId} not found`,
      });
    });
  });
});
