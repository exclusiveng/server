/**
 * Product API Test Examples
 * 
 * This file contains example code snippets for testing the Product API
 * You can use these examples with tools like Postman, Insomnia, or in your frontend code
 */

// ============================================
// 1. CREATE A PRODUCT
// ============================================

// Using Fetch API (Browser/Node.js with node-fetch)
async function createProduct() {
  const formData = new FormData();
  formData.append('title', 'Luxury Brazilian Hair Wig');
  formData.append('description', 'Premium quality Brazilian human hair lace front wig with natural hairline');
  formData.append('price', '299.99');
  formData.append('category', 'Lace Front Wigs');
  formData.append('stock_quantity', '15');
  formData.append('tags', 'brazilian-hair,lace-front,premium,human-hair');
  
  // Assuming you have a file input element
  const fileInput = document.getElementById('imageInput');
  formData.append('image', fileInput.files[0]);

  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Product created:', data);
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
  }
}

// Using cURL (Command Line)
/*
curl -X POST http://localhost:3000/api/products \
  -F "title=Luxury Brazilian Hair Wig" \
  -F "description=Premium quality Brazilian human hair lace front wig" \
  -F "price=299.99" \
  -F "category=Lace Front Wigs" \
  -F "stock_quantity=15" \
  -F "tags=brazilian-hair,lace-front,premium" \
  -F "image=@/path/to/your/image.jpg"
*/

// ============================================
// 2. GET ALL PRODUCTS
// ============================================

async function getAllProducts(filters = {}) {
  const params = new URLSearchParams(filters);
  
  try {
    const response = await fetch(`http://localhost:3000/api/products?${params}`);
    const data = await response.json();
    console.log('Products:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Example usage with filters
getAllProducts({
  category: 'Lace Front Wigs',
  min_price: 100,
  max_price: 500,
  is_available: true,
  sort_by: 'price',
  order: 'ASC',
  page: 1,
  limit: 10
});

// Using cURL
/*
curl "http://localhost:3000/api/products?category=Lace%20Front%20Wigs&min_price=100&max_price=500&sort_by=price&order=ASC"
*/

// ============================================
// 3. GET SINGLE PRODUCT
// ============================================

async function getProduct(productId) {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`);
    const data = await response.json();
    console.log('Product:', data);
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
  }
}

// Using cURL
/*
curl http://localhost:3000/api/products/your-product-id-here
*/

// ============================================
// 4. UPDATE PRODUCT
// ============================================

async function updateProduct(productId, updates) {
  const formData = new FormData();
  
  // Add only the fields you want to update
  if (updates.title) formData.append('title', updates.title);
  if (updates.description) formData.append('description', updates.description);
  if (updates.price) formData.append('price', updates.price.toString());
  if (updates.category) formData.append('category', updates.category);
  if (updates.stock_quantity !== undefined) formData.append('stock_quantity', updates.stock_quantity.toString());
  if (updates.tags) formData.append('tags', Array.isArray(updates.tags) ? updates.tags.join(',') : updates.tags);
  if (updates.is_available !== undefined) formData.append('is_available', updates.is_available.toString());
  if (updates.is_favorite !== undefined) formData.append('is_favorite', updates.is_favorite.toString());
  if (updates.image) formData.append('image', updates.image);

  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      body: formData
    });

    const data = await response.json();
    console.log('Product updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
  }
}

// Example usage
updateProduct('product-id-here', {
  price: 349.99,
  stock_quantity: 20,
  is_available: true
});

// Using cURL
/*
curl -X PUT http://localhost:3000/api/products/your-product-id \
  -F "price=349.99" \
  -F "stock_quantity=20" \
  -F "is_available=true"
*/

// ============================================
// 5. DELETE PRODUCT
// ============================================

async function deleteProduct(productId) {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    console.log('Product deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

// Using cURL
/*
curl -X DELETE http://localhost:3000/api/products/your-product-id
*/

// ============================================
// 6. ADD PRODUCT RATING
// ============================================

async function addRating(productId, rating) {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating })
    });

    const data = await response.json();
    console.log('Rating added:', data);
    return data;
  } catch (error) {
    console.error('Error adding rating:', error);
  }
}

// Example usage
addRating('product-id-here', 4.5);

// Using cURL
/*
curl -X POST http://localhost:3000/api/products/your-product-id/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 4.5}'
*/

// ============================================
// 7. TOGGLE FAVORITE
// ============================================

async function toggleFavorite(productId) {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}/favorite`, {
      method: 'POST'
    });

    const data = await response.json();
    console.log('Favorite toggled:', data);
    return data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

// Using cURL
/*
curl -X POST http://localhost:3000/api/products/your-product-id/favorite
*/

// ============================================
// 8. SEARCH PRODUCTS
// ============================================

async function searchProducts(searchTerm) {
  const params = new URLSearchParams({
    search: searchTerm,
    sort_by: 'rating',
    order: 'DESC'
  });

  try {
    const response = await fetch(`http://localhost:3000/api/products?${params}`);
    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
  }
}

// Example usage
searchProducts('brazilian hair');

// ============================================
// 9. GET FAVORITE PRODUCTS
// ============================================

async function getFavoriteProducts() {
  const params = new URLSearchParams({
    is_favorite: 'true',
    sort_by: 'created_at',
    order: 'DESC'
  });

  try {
    const response = await fetch(`http://localhost:3000/api/products?${params}`);
    const data = await response.json();
    console.log('Favorite products:', data);
    return data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
  }
}

// ============================================
// 10. COMPLETE REACT COMPONENT EXAMPLE
// ============================================

/*
import React, { useState, useEffect } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    search: '',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await fetch(`http://localhost:3000/api/products?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}/favorite`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        // Refresh products
        fetchProducts();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRateProduct = async (productId, rating) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error rating product:', error);
    }
  };

  return (
    <div className="product-list">
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min price"
          value={filters.min_price}
          onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.max_price}
          onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={`http://localhost:3000${product.image_url}`} alt={product.title} />
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p className="price">${product.price}</p>
              <div className="rating">
                Rating: {product.rating.toFixed(1)} ({product.review_count} reviews)
              </div>
              <button onClick={() => handleAddToFavorites(product.id)}>
                {product.is_favorite ? '❤️' : '🤍'}
              </button>
              <button onClick={() => handleRateProduct(product.id, 5)}>
                Rate 5 Stars
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
*/

// ============================================
// 11. ERROR HANDLING EXAMPLE
// ============================================

async function createProductWithErrorHandling(productData) {
  const formData = new FormData();
  
  Object.entries(productData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (response.status === 400 && data.errors) {
        console.error('Validation errors:', data.errors);
        // Display errors to user
        Object.entries(data.errors).forEach(([field, message]) => {
          console.error(`${field}: ${message}`);
        });
        return { success: false, errors: data.errors };
      }

      // Handle other errors
      throw new Error(data.message || 'Failed to create product');
    }

    console.log('Product created successfully:', data);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    addRating,
    toggleFavorite,
    searchProducts,
    getFavoriteProducts,
    createProductWithErrorHandling
  };
}
