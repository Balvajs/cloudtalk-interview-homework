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
