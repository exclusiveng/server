# Product Management API Documentation

## Overview
This API provides comprehensive product management functionality for the wig selling business. All endpoints are currently **public** (no authentication required) but include robust validation and sanitization to prevent exploits.

## Security Features

### Input Sanitization
- All text inputs are automatically sanitized to remove potentially harmful characters
- HTML tags (`<`, `>`) are stripped from all string inputs
- File names are sanitized to prevent path traversal attacks

### File Upload Security
- **Maximum file size**: 5MB
- **Allowed file types**: JPEG, JPG, PNG, WebP
- **MIME type validation**: Files are validated against their actual MIME type
- **Extension validation**: File extensions must match their MIME type
- **Secure file naming**: Uploaded files are renamed with cryptographically secure random names
- **Path traversal prevention**: File paths are validated to prevent directory traversal attacks

### Rate Limiting
- API requests are rate-limited to prevent abuse
- Default: 100 requests per 15 minutes per IP address

### Validation
- All inputs are validated with strict rules
- Price limits: 0 to 1,000,000
- Stock quantity limits: 0 to 1,000,000
- Title length: 3-255 characters
- Description length: max 2,000 characters
- Tags: max 20 tags, each max 50 characters

## API Endpoints

### Base URL
```
http://localhost:3000/api/products
```

---

### 1. Get All Products
**GET** `/api/products`

Retrieve all products with optional filtering, sorting, and pagination.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `category` | string | Filter by category | - |
| `is_favorite` | boolean | Filter by favorite status | - |
| `is_available` | boolean | Filter by availability | - |
| `min_price` | number | Minimum price filter | - |
| `max_price` | number | Maximum price filter | - |
| `search` | string | Search in title and description | - |
| `sort_by` | string | Sort field (created_at, price, rating, title) | created_at |
| `order` | string | Sort order (ASC, DESC) | DESC |
| `page` | number | Page number | 1 |
| `limit` | number | Items per page (max 100) | 20 |

#### Example Request
```bash
curl "http://localhost:3000/api/products?category=wigs&min_price=50&max_price=200&page=1&limit=10"
```

#### Example Response
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "title": "Premium Lace Front Wig",
        "description": "High-quality human hair lace front wig",
        "price": 150.00,
        "image_url": "/uploads/products/1234567890-abcdef.jpg",
        "rating": 4.5,
        "review_count": 10,
        "is_favorite": false,
        "category": "wigs",
        "stock_quantity": 25,
        "is_available": true,
        "tags": ["lace-front", "human-hair", "premium"],
        "created_at": "2025-12-06T01:00:00.000Z",
        "updated_at": "2025-12-06T01:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Product by ID
**GET** `/api/products/:id`

Retrieve a single product by its ID.

#### Example Request
```bash
curl "http://localhost:3000/api/products/uuid-here"
```

#### Example Response
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Premium Lace Front Wig",
    "description": "High-quality human hair lace front wig",
    "price": 150.00,
    "image_url": "/uploads/products/1234567890-abcdef.jpg",
    "rating": 4.5,
    "review_count": 10,
    "is_favorite": false,
    "category": "wigs",
    "stock_quantity": 25,
    "is_available": true,
    "tags": ["lace-front", "human-hair", "premium"],
    "created_at": "2025-12-06T01:00:00.000Z",
    "updated_at": "2025-12-06T01:00:00.000Z"
  }
}
```

---

### 3. Create Product
**POST** `/api/products`

Create a new product with an image upload.

#### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Product title (3-255 chars) |
| `description` | string | No | Product description (max 2000 chars) |
| `price` | number | Yes | Product price (0-1,000,000) |
| `category` | string | No | Product category (max 100 chars) |
| `stock_quantity` | number | No | Stock quantity (0-1,000,000) |
| `tags` | string/array | No | Comma-separated tags or array (max 20 tags) |
| `image` | file | Yes | Product image (max 5MB, JPEG/PNG/WebP) |

#### Example Request (using curl)
```bash
curl -X POST http://localhost:3000/api/products \
  -F "title=Premium Lace Front Wig" \
  -F "description=High-quality human hair lace front wig" \
  -F "price=150.00" \
  -F "category=wigs" \
  -F "stock_quantity=25" \
  -F "tags=lace-front,human-hair,premium" \
  -F "image=@/path/to/image.jpg"
```

#### Example Request (using JavaScript Fetch)
```javascript
const formData = new FormData();
formData.append('title', 'Premium Lace Front Wig');
formData.append('description', 'High-quality human hair lace front wig');
formData.append('price', '150.00');
formData.append('category', 'wigs');
formData.append('stock_quantity', '25');
formData.append('tags', 'lace-front,human-hair,premium');
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

#### Example Response
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "title": "Premium Lace Front Wig",
    "description": "High-quality human hair lace front wig",
    "price": 150.00,
    "image_url": "/uploads/products/1234567890-abcdef.jpg",
    "rating": 0,
    "review_count": 0,
    "is_favorite": false,
    "category": "wigs",
    "stock_quantity": 25,
    "is_available": true,
    "tags": ["lace-front", "human-hair", "premium"],
    "created_at": "2025-12-06T01:00:00.000Z",
    "updated_at": "2025-12-06T01:00:00.000Z"
  }
}
```

---

### 4. Update Product
**PUT** `/api/products/:id`

Update an existing product. Image upload is optional.

#### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Product title (3-255 chars) |
| `description` | string | No | Product description (max 2000 chars) |
| `price` | number | No | Product price (0-1,000,000) |
| `category` | string | No | Product category (max 100 chars) |
| `stock_quantity` | number | No | Stock quantity (0-1,000,000) |
| `tags` | string/array | No | Comma-separated tags or array |
| `is_available` | boolean | No | Product availability |
| `is_favorite` | boolean | No | Favorite status |
| `image` | file | No | New product image (max 5MB) |

#### Example Request
```bash
curl -X PUT http://localhost:3000/api/products/uuid-here \
  -F "price=175.00" \
  -F "stock_quantity=30" \
  -F "is_available=true"
```

#### Example Response
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "title": "Premium Lace Front Wig",
    "price": 175.00,
    "stock_quantity": 30,
    "is_available": true,
    ...
  }
}
```

---

### 5. Delete Product
**DELETE** `/api/products/:id`

Delete a product and its associated image file.

#### Example Request
```bash
curl -X DELETE http://localhost:3000/api/products/uuid-here
```

#### Example Response
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

---

### 6. Add Product Rating
**POST** `/api/products/:id/rating`

Add a rating to a product. The average rating is automatically calculated.

#### Request Body (JSON)
```json
{
  "rating": 4.5
}
```

#### Validation
- Rating must be between 0 and 5
- Rating can have up to 2 decimal places

#### Example Request
```bash
curl -X POST http://localhost:3000/api/products/uuid-here/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 4.5}'
```

#### Example Response
```json
{
  "status": "success",
  "message": "Product rating updated successfully",
  "data": {
    "rating": 4.3,
    "review_count": 11
  }
}
```

---

### 7. Toggle Favorite
**POST** `/api/products/:id/favorite`

Toggle the favorite status of a product.

#### Example Request
```bash
curl -X POST http://localhost:3000/api/products/uuid-here/favorite
```

#### Example Response
```json
{
  "status": "success",
  "message": "Product favorite status updated",
  "data": {
    "is_favorite": true
  }
}
```

---

## Error Responses

### Validation Error
```json
{
  "message": "Validation failed",
  "errors": {
    "title": "title is required",
    "price": "Price must be a positive number"
  }
}
```

### File Upload Error
```json
{
  "status": "error",
  "message": "File size exceeds maximum allowed size of 5MB"
}
```

### Not Found Error
```json
{
  "status": "error",
  "message": "Product not found"
}
```

### Server Error
```json
{
  "status": "error",
  "message": "Failed to create product"
}
```

---

## File Upload Directory Structure

Uploaded product images are stored in:
```
project-root/
└── uploads/
    └── products/
        ├── 1733447123456-a1b2c3d4e5f6.jpg
        ├── 1733447234567-f6e5d4c3b2a1.png
        └── ...
```

Files are accessible via:
```
http://localhost:3000/uploads/products/filename.jpg
```

---

## Testing with Postman

1. **Create a new request**
2. **Set method to POST**
3. **URL**: `http://localhost:3000/api/products`
4. **Body**: Select "form-data"
5. **Add fields**:
   - title: "Test Wig"
   - price: "99.99"
   - description: "Test description"
   - category: "wigs"
   - stock_quantity: "10"
   - tags: "test,sample"
   - image: (select file type and upload an image)

---

## Future Enhancements

### Recommended for Production:
1. **Authentication**: Add admin authentication for create, update, and delete operations
2. **Image Optimization**: Implement automatic image resizing and optimization
3. **CDN Integration**: Store images on a CDN for better performance
4. **Advanced Search**: Implement full-text search with Elasticsearch
5. **Caching**: Add Redis caching for frequently accessed products
6. **Reviews System**: Expand rating to include detailed reviews
7. **Inventory Management**: Add low-stock alerts and automatic availability updates

---

## Environment Variables

Add these to your `.env` file:

```env
# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=uploads/products

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Notes

- All endpoints automatically sanitize inputs to prevent XSS attacks
- File uploads are validated for type, size, and content
- The API uses UUID for product IDs for better security
- Pagination is limited to 100 items per page maximum
- Images are served as static files from the `/uploads` directory
- Old images are automatically deleted when updating or deleting products
