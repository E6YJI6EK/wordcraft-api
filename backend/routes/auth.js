const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует.'
      });
    }

    // Создаем нового пользователя
    const user = await User.create({
      name,
      email,
      password
    });

    // Генерируем токен
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации пользователя.',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Вход пользователя
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверяем наличие email и пароля
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, введите email и пароль.'
      });
    }

    // Находим пользователя и включаем пароль для проверки
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверные учетные данные.'
      });
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверные учетные данные.'
      });
    }

    // Обновляем время последнего входа
    user.lastLogin = Date.now();
    await user.save();

    // Генерируем токен
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Вход выполнен успешно.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при входе в систему.',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Получение данных текущего пользователя
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных пользователя.',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Обновление профиля пользователя
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Проверяем, не занят ли email другим пользователем
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует.'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Профиль обновлен успешно.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля.',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Выход пользователя
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Выход выполнен успешно.'
  });
});

module.exports = router; 