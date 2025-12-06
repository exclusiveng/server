import { ValidationRule } from '../middleware/validation.middleware';

export const createProductValidation: ValidationRule[] = [
  {
    field: 'title',
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 255,
  },
  {
    field: 'description',
    required: false,
    type: 'string',
    maxLength: 2000,
  },
  {
    field: 'price',
    required: true,
    custom: (value) => {
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) {
        return 'Price must be a positive number';
      }
      if (price > 1000000) {
        return 'Price exceeds maximum allowed value';
      }
      return true;
    },
  },
  {
    field: 'category',
    required: false,
    type: 'string',
    maxLength: 100,
  },
  {
    field: 'stock_quantity',
    required: false,
    custom: (value) => {
      if (value === undefined || value === null || value === '') return true;
      const quantity = parseInt(value);
      if (isNaN(quantity) || quantity < 0) {
        return 'Stock quantity must be a non-negative integer';
      }
      if (quantity > 1000000) {
        return 'Stock quantity exceeds maximum allowed value';
      }
      return true;
    },
  },
  {
    field: 'tags',
    required: false,
    custom: (value) => {
      if (!value) return true;
      
      let tags: string[];
      if (typeof value === 'string') {
        tags = value.split(',').map((tag: string) => tag.trim());
      } else if (Array.isArray(value)) {
        tags = value;
      } else {
        return 'Tags must be a string or array';
      }

      if (tags.length > 20) {
        return 'Maximum 20 tags allowed';
      }

      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length > 50) {
          return 'Each tag must be a string with maximum 50 characters';
        }
      }

      return true;
    },
  },
];

export const updateProductValidation: ValidationRule[] = [
  {
    field: 'title',
    required: false,
    type: 'string',
    minLength: 3,
    maxLength: 255,
  },
  {
    field: 'description',
    required: false,
    type: 'string',
    maxLength: 2000,
  },
  {
    field: 'price',
    required: false,
    custom: (value) => {
      if (value === undefined || value === null || value === '') return true;
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) {
        return 'Price must be a positive number';
      }
      if (price > 1000000) {
        return 'Price exceeds maximum allowed value';
      }
      return true;
    },
  },
  {
    field: 'category',
    required: false,
    type: 'string',
    maxLength: 100,
  },
  {
    field: 'stock_quantity',
    required: false,
    custom: (value) => {
      if (value === undefined || value === null || value === '') return true;
      const quantity = parseInt(value);
      if (isNaN(quantity) || quantity < 0) {
        return 'Stock quantity must be a non-negative integer';
      }
      if (quantity > 1000000) {
        return 'Stock quantity exceeds maximum allowed value';
      }
      return true;
    },
  },
  {
    field: 'is_available',
    required: false,
    custom: (value) => {
      if (value === undefined || value === null || value === '') return true;
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return 'is_available must be a boolean';
      }
      return true;
    },
  },
  {
    field: 'is_favorite',
    required: false,
    custom: (value) => {
      if (value === undefined || value === null || value === '') return true;
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return 'is_favorite must be a boolean';
      }
      return true;
    },
  },
  {
    field: 'tags',
    required: false,
    custom: (value) => {
      if (!value) return true;
      
      let tags: string[];
      if (typeof value === 'string') {
        tags = value.split(',').map((tag: string) => tag.trim());
      } else if (Array.isArray(value)) {
        tags = value;
      } else {
        return 'Tags must be a string or array';
      }

      if (tags.length > 20) {
        return 'Maximum 20 tags allowed';
      }

      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length > 50) {
          return 'Each tag must be a string with maximum 50 characters';
        }
      }

      return true;
    },
  },
];

export const ratingValidation: ValidationRule[] = [
  {
    field: 'rating',
    required: true,
    custom: (value) => {
      const rating = parseFloat(value);
      if (isNaN(rating)) {
        return 'Rating must be a number';
      }
      if (rating < 0 || rating > 5) {
        return 'Rating must be between 0 and 5';
      }
      return true;
    },
  },
];
