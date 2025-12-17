import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { successResponse, errorResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Generate JWT token for authenticated user
 */
const generateToken = (user: User): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn } as jwt.SignOptions
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Get user repository
    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      errorResponse(res, 'User with this email already exists', 409);
      return;
    }

    // Create new user
    const user = userRepository.create({
      email,
      password, // Will be hashed by @BeforeInsert hook
      firstName,
      lastName,
      role: role || UserRole.USER, // Default to USER role if not specified
    });

    // Save user to database
    await userRepository.save(user);

    // Generate JWT token
    const token = generateToken(user);

    // Return success response (password excluded via toJSON method)
    successResponse(
      res,
      {
        user: user.toJSON(),
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    errorResponse(res, 'Failed to register user', 500);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Get user repository
    const userRepository = AppDataSource.getRepository(User);

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      errorResponse(res, 'Account is deactivated. Please contact support.', 403);
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    successResponse(
      res,
      {
        user: user.toJSON(),
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Failed to login', 500);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // User ID is attached to request by authenticate middleware
    if (!req.user) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    // Get user repository
    const userRepository = AppDataSource.getRepository(User);

    // Find user by ID
    const user = await userRepository.findOne({ where: { id: req.user.id } });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Check if user is still active
    if (!user.isActive) {
      errorResponse(res, 'Account is deactivated', 403);
      return;
    }

    // Return user profile
    successResponse(res, user.toJSON(), 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const { firstName, lastName, address, city, state, phoneNumber } = req.body;

    // Get user repository
    const userRepository = AppDataSource.getRepository(User);

    // Find user by ID
    const user = await userRepository.findOne({ where: { id: req.user.id } });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    // Save updated user
    await userRepository.save(user);

    // Return updated user profile
    successResponse(res, user.toJSON(), 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 'Failed to update profile', 500);
  }
};

