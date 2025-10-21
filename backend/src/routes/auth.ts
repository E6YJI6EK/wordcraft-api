import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Пользователь создан
 */
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 1
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Успешный вход
 */
// @desc    Вход пользователя
// @access  Public
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Получение данных текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 */
// @desc    Получение данных текущего пользователя
// @access  Private
router.get('/me', protect, authController.getMe);

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Обновление профиля пользователя
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Профиль обновлен
 */
// @desc    Обновление профиля пользователя
// @access  Private
router.put('/profile', protect, validateBody(updateProfileSchema), authController.updateProfile);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Выход пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Выход выполнен
 */
// @desc    Выход пользователя
// @access  Private
router.post('/logout', protect, authController.logout);

export default router; 