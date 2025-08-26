import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../../app.ts';
import { setupTestDatabase } from '../../../test/setup-test-database.ts';

vi.mock(import('../../../db/database.ts'));

describe('Products API', () => {
  beforeAll(async () => {
    const { cleanupTestDatabase } = await setupTestDatabase();

    return cleanupTestDatabase;
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
        .delete(`/products/${fakeId}`)
        .expect(404);

      expect(response.body).toEqual({
        error: `Product with ID ${fakeId} not found`,
      });
    });
  });
});
