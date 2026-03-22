# Product Catalog API

A simple CRUD API for a Product Catalog built with Fastify and TypeScript.

## Features

- Complete CRUD operations for products
- In-memory database with file-based persistence for horizontal scaling
- Input validation with Zod
- Error handling
- Horizontal scaling with cluster mode and load balancer
- Comprehensive test suite
- Development and production modes

## Requirements

- Node.js 24.10.0 or higher
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```

4. Configure the port in `.env` file:
    ```
    PORT=4000
    NODE_ENV=development
    ```

## Running the Application

### Development Mode
Start the application in development mode with hot-reload:
```bash
npm run start:dev
```
The server will start on `http://localhost:4000` (or the port specified in `.env`).

### Production Mode
Build and start the application in production mode:
```bash
npm run start:prod
```

### Cluster Mode (Horizontal Scaling)
Start multiple worker instances with a load balancer:
```bash
npm run start:multi
```
This will start a load balancer on the main port and worker instances on ports `PORT+1`, `PORT+2`, etc.

## API Endpoints

### Get All Products
```http
GET /api/products
```
Returns all products in the database.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": "electronics",
    "inStock": true
  }
]
```

### Get Product by ID
```http
GET /api/products/{productId}
```
Returns a single product by its ID.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "category": "electronics",
  "inStock": true
}
```

**Error Responses:**
- `400` - Invalid UUID format
- `404` - Product not found

### Create Product
```http
POST /api/products
Content-Type: application/json
```
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "category": "books",
  "inStock": true
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "category": "books",
  "inStock": true
}
```

**Error Response (400):**
- Missing required fields
- Invalid price (not a positive number)

### Update Product
```http
PUT /api/products/{productId}
Content-Type: application/json
```
```json
{
  "name": "Updated Product",
  "price": 59.99
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Product",
  "description": "Product description",
  "price": 59.99,
  "category": "books",
  "inStock": true
}
```

**Error Responses:**
- `400` - Invalid UUID format or invalid data
- `404` - Product not found

### Delete Product
```http
DELETE /api/products/{productId}
```

**Response (204):** No content

**Error Responses:**
- `400` - Invalid UUID format
- `404` - Product not found

## Product Schema
- `id` (string, UUID, auto-generated)
- `name` (string, required)
- `description` (string, required)
- `price` (number, required, must be > 0)
- `category` (string, required)
- `inStock` (boolean, required)

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Error Handling

The API handles errors gracefully:
- `400` - Bad Request (invalid input data, validation errors)
- `404` - Not Found (resource or endpoint not found)
- `500` - Internal Server Error (server-side errors)

## Horizontal Scaling

The application supports horizontal scaling using Node.js Cluster API:

1. A load balancer listens on the main port (e.g., 4000)
2. Multiple worker instances listen on consecutive ports (4001, 4002, etc.)
3. The load balancer distributes requests using round-robin algorithm
4. All workers share the same database state through file-based storage

## Note on Database Storage

The application uses an in-memory database with file-based persistence (`db.json`). This ensures that:
- Data persists between restarts
- All worker instances access the same data
- Horizontal scaling works correctly with shared state

**Important:** The `db.json` file will be created automatically on first run. Do not commit this file to version control.