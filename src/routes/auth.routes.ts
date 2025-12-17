import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Registration validation rules
const registerValidation = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string', minLength: 8 },
  { field: 'firstName', required: true, type: 'string', minLength: 2 },
  { field: 'lastName', required: true, type: 'string', minLength: 2 },
]);

// Login validation rules
const loginValidation = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string' },
]);

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
