# Product API Quick Reference

## 🚀 Quick Start

```bash
# Start server
npm run dev

# Server runs on
http://localhost:3000
```

## 📍 Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | `GET` | `/api/products` |
| Get one | `GET` | `/api/products/:id` |
| Create | `POST` | `/api/products` |
| Update | `PUT` | `/api/products/:id` |
| Delete | `DELETE` | `/api/products/:id` |
| Rate | `POST` | `/api/products/:id/rating` |
| Favorite | `POST` | `/api/products/:id/favorite` |

## 📝 Create Product (Form Data)

```bash
curl -X POST http://localhost:3000/api/products \
  -F "title=Wig Name" \
  -F "description=Description here" \
  -F "price=99.99" \
  -F "category=Category Name" \
  -F "stock_quantity=10" \
  -F "tags=tag1,tag2,tag3" \
  -F "image=@/path/to/image.jpg"
```

## 🔍 Filter Products

```bash
# By category
?category=Lace%20Front

# By price
?min_price=100&max_price=300

# Search
?search=brazilian

# Favorites only
?is_favorite=true

# Available only
?is_available=true

# Sort
?sort_by=price&order=ASC
?sort_by=rating&order=DESC

# Pagination
?page=1&limit=20
```

## ⭐ Add Rating (JSON)

```bash
curl -X POST http://localhost:3000/api/products/{id}/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 4.5}'
```

## ❤️ Toggle Favorite

```bash
curl -X POST http://localhost:3000/api/products/{id}/favorite
```

## 🔒 Security Features

✅ File size limit: 5MB
✅ Allowed types: JPEG, PNG, WebP
✅ Input sanitization
✅ MIME type validation
✅ Path traversal prevention
✅ Rate limiting: 100 req/15min
✅ XSS protection
✅ SQL injection protection

## 📦 Product Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | 3-255 chars |
| description | string | No | Max 2000 chars |
| price | number | Yes | 0-1,000,000 |
| category | string | No | Max 100 chars |
| stock_quantity | number | No | 0-1,000,000 |
| tags | string/array | No | Max 20 tags |
| image | file | Yes* | Max 5MB |
| is_available | boolean | No | Default: true |
| is_favorite | boolean | No | Default: false |

*Required for create, optional for update

## 🖼️ Image Access

```
http://localhost:3000/uploads/products/{filename}
```

## 📊 Response Format

### Success
```json
{
  "status": "success",
  "message": "...",
  "data": { ... }
}
```

### Error
```json
{
  "status": "error",
  "message": "...",
  "errors": { ... }
}
```

## 🧪 Test with JavaScript

```javascript
// Create product
const formData = new FormData();
formData.append('title', 'Product Name');
formData.append('price', '99.99');
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  body: formData
});

// Get products
const products = await fetch('http://localhost:3000/api/products?category=wigs');
const data = await products.json();

// Add rating
await fetch(`http://localhost:3000/api/products/${id}/rating`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rating: 4.5 })
});
```

## 📚 Documentation

- Full API docs: `PRODUCT_API.md`
- Implementation details: `PRODUCT_IMPLEMENTATION.md`
- Code examples: `examples/product-api-examples.js`

## ⚠️ Important Notes

- Routes are currently **public** (no auth)
- Add admin auth in production
- Images stored in `uploads/products/`
- Old images auto-deleted on update/delete
- Max 100 items per page
- Rating auto-averaged
