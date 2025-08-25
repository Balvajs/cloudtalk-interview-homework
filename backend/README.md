# Express API for Warehouse app

This folder serves as the scaffold of the application that is a part of the interview process for candidates attending on the position in CloudTalk.

## Assignment

1. Warehouse application, needs API for following features
   1. Table of products that are available
   2. Product definition (required properties)
      1. ID
      2. Name
      3. Quantity
      4. Unit price (euros)

   3. Product manipulation
      1. CRUD operations

   4. Shipments (optional)

2. Please at the development consider
   1. Development best practices
   2. Testing
   3. Simulate a situation in which you work with the team (pay attention to how you work with Git)

3. This is a bare minimum, there are no limits to creativity, just keep in mind what we wanted

We wish you good luck and a clear mind! We are looking forward to seeing you!

PS: We should be able to run application locally, thus start the backend and be able to use endpoints through the curl/postman.

## Setup & Running

### Prerequisites

- Node.js 24.5.0 (see .nvmrc)
- PostgreSQL database
- Docker (optional, for database setup)

### Environment Setup

1. Copy `.env.example` to `.env`
2. Set your `DATABASE_URL` in `.env` file

### Database Setup

```bash
# Start PostgreSQL with Docker
npm run db:start

# Push schema to database
npm run db:update

# Optional: Seed database with sample data
npm run db:seed

# Optional: Seed database with custom rows count
npm run db:seed -- --count=1000
```

### Running the Application

```bash
# Install dependencies
npm install

# Development mode (with file watching)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Products

- `GET /products` - Get all products with pagination
- `GET /products/:id` - Get a specific product by ID
- `POST /products` - Create a new product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

#### Pagination Parameters

The `GET /products` endpoint supports the following query parameters:

- `limit` (number, 1-100, default: 20) - Number of items per page
- `cursor` (string, optional) - Cursor for pagination (ISO datetime string)
- `order` (string, optional) - Sort order: 'asc' or 'desc' (default: 'asc')

#### Pagination Response Format

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "quantity": 10,
      "price": 29.99,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "hasNextPage": true,
    "nextCursor": "2024-01-01T00:00:00.000Z",
    "limit": 20,
    "order": "asc"
  }
}
```

#### Example Usage

```bash
# Get first page of products
curl "http://localhost:3000/products"

# Get products with custom limit
curl "http://localhost:3000/products?limit=10"

# Get next page using cursor (ISO datetime)
curl "http://localhost:3000/products?limit=10&cursor=2024-01-01T12:00:00.000Z"

# Get products in descending order
curl "http://localhost:3000/products?order=desc"

# Get a specific product
curl "http://localhost:3000/products/product-id-here"

# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "quantity": 10, "price": 999.99}'

# Update a product
curl -X PUT http://localhost:3000/products/[id] \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Laptop", "quantity": 5, "price": 1199.99}'

# Delete a product
curl -X DELETE http://localhost:3000/products/[id]
```
