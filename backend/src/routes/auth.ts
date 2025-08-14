import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', validateBody(registerSchema), authController.register);

// @route   POST /api/auth/login
// @desc    Вход пользователя
// @access  Public
router.post('/login', validateBody(loginSchema), authController.login);

// @route   GET /api/auth/me
// @desc    Получение данных текущего пользователя
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/profile
// @desc    Обновление профиля пользователя
// @access  Private
router.put('/profile', protect, validateBody(updateProfileSchema), authController.updateProfile);

// @route   POST /api/auth/logout
// @desc    Выход пользователя
// @access  Private
router.post('/logout', protect, authController.logout);

export default router; 