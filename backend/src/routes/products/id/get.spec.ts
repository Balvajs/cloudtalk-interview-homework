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

    it('should return 404 for non-existing product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app).get(`/products/${fakeId}`).expect(404);
    });
  });
});
