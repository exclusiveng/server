import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { UploadedFile } from 'express-fileupload';
import { saveUploadedFile, deleteFile, FileUploadError } from '../utils/fileUpload';
import path from 'path';

const productRepository = AppDataSource.getRepository(Product);

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, category, stock_quantity, tags } = req.body;

    // Check if image file is uploaded
    if (!req.files || !req.files.image) {
      res.status(400).json({
        status: 'error',
        message: 'Product image is required',
      });
      return;
    }

    const imageFile = req.files.image as UploadedFile;

    // Save uploaded file
    let uploadResult;
    try {
      uploadResult = await saveUploadedFile(imageFile, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      });
    } catch (error) {
      if (error instanceof FileUploadError) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      throw error;
    }

    // Parse tags if it's a string
    let parsedTags: string[] | undefined;
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Create product
    const product = productRepository.create({
      title,
      description,
      price: parseFloat(price),
      image_url: uploadResult.url,
      category,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
      tags: parsedTags,
      rating: 0,
      review_count: 0,
      is_favorite: false,
      is_available: true,
    });

    await productRepository.save(product);

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create product',
    });
  }
};

/**
 * Get all products with optional filtering
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      is_favorite,
      is_available,
      min_price,
      max_price,
      search,
      sort_by = 'created_at',
      order = 'DESC',
      page = '1',
      limit = '20',
    } = req.query;

    const queryBuilder = productRepository.createQueryBuilder('product');

    // Apply filters
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (is_favorite !== undefined) {
      queryBuilder.andWhere('product.is_favorite = :is_favorite', {
        is_favorite: is_favorite === 'true',
      });
    }

    if (is_available !== undefined) {
      queryBuilder.andWhere('product.is_available = :is_available', {
        is_available: is_available === 'true',
      });
    }

    if (min_price) {
      queryBuilder.andWhere('product.price >= :min_price', {
        min_price: parseFloat(min_price as string),
      });
    }

    if (max_price) {
      queryBuilder.andWhere('product.price <= :max_price', {
        max_price: parseFloat(max_price as string),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    const validSortFields = ['created_at', 'price', 'rating', 'title'];
    const sortField = validSortFields.includes(sort_by as string)
      ? (sort_by as string)
      : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    queryBuilder.skip(skip).take(limitNum);

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount();

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products',
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product',
    });
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock_quantity, tags, is_available, is_favorite } =
      req.body;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    // Handle image update if new image is uploaded
    if (req.files && req.files.image) {
      const imageFile = req.files.image as UploadedFile;

      try {
        const uploadResult = await saveUploadedFile(imageFile, {
          maxSize: 5 * 1024 * 1024,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        });

        // Delete old image
        const oldImagePath = path.join(process.cwd(), 'uploads', 'products', path.basename(product.image_url));
        deleteFile(oldImagePath);

        product.image_url = uploadResult.url;
      } catch (error) {
        if (error instanceof FileUploadError) {
          res.status(400).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        throw error;
      }
    }

    // Update fields
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category !== undefined) product.category = category;
    if (stock_quantity !== undefined) product.stock_quantity = parseInt(stock_quantity);
    if (is_available !== undefined) product.is_available = is_available === 'true' || is_available === true;
    if (is_favorite !== undefined) product.is_favorite = is_favorite === 'true' || is_favorite === true;

    // Parse tags
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        product.tags = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        product.tags = tags;
      }
    }

    await productRepository.save(product);

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product',
    });
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    // Delete product image
    const imagePath = path.join(process.cwd(), 'uploads', 'products', path.basename(product.image_url));
    deleteFile(imagePath);

    // Delete product from database
    await productRepository.remove(product);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product',
    });
  }
};

/**
 * Update product rating
 */
export const updateProductRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    const newRating = parseFloat(rating);
    if (newRating < 0 || newRating > 5) {
      res.status(400).json({
        status: 'error',
        message: 'Rating must be between 0 and 5',
      });
      return;
    }

    // Calculate new average rating
    const totalRating = product.rating * product.review_count + newRating;
    product.review_count += 1;
    product.rating = totalRating / product.review_count;

    await productRepository.save(product);

    res.status(200).json({
      status: 'success',
      message: 'Product rating updated successfully',
      data: {
        rating: product.rating,
        review_count: product.review_count,
      },
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product rating',
    });
  }
};

/**
 * Toggle product favorite status
 */
export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
      return;
    }

    product.is_favorite = !product.is_favorite;
    await productRepository.save(product);

    res.status(200).json({
      status: 'success',
      message: 'Product favorite status updated',
      data: {
        is_favorite: product.is_favorite,
      },
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update favorite status',
    });
  }
};
