import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductRating,
  toggleFavorite,
} from '../controllers/product.controller';
import { validate } from '../middleware/validation.middleware';
import {
  createProductValidation,
  updateProductValidation,
  ratingValidation,
} from '../utils/productValidation';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filtering and pagination
 * @access  Public
 * @query   category, is_favorite, is_available, min_price, max_price, search, sort_by, order, page, limit
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Admin only
 * @body    title, description, price, category, stock_quantity, tags, image (file)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createProductValidation),
  createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Admin only
 * @body    title, description, price, category, stock_quantity, tags, is_available, is_favorite, image (file, optional)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateProductValidation),
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Admin only
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteProduct);

/**
 * @route   POST /api/products/:id/rating
 * @desc    Add a rating to a product
 * @access  Public
 * @body    rating (0-5)
 */
router.post('/:id/rating', authenticate, validate(ratingValidation), authorize(UserRole.USER), updateProductRating);

/**
 * @route   POST /api/products/:id/favorite
 * @desc    Toggle favorite status of a product
 * @access  User only
 */
router.post('/:id/favorite', authenticate, authorize(UserRole.USER), toggleFavorite);

export default router;
