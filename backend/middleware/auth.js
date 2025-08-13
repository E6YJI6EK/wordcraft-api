const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Document = require('../models/Document');

// Middleware для защиты маршрутов
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Проверяем наличие токена в заголовке
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Проверяем наличие токена
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Требуется авторизация.'
      });
    }

    try {
      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при аутентификации.'
    });
  }
};

// Middleware для проверки роли
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для выполнения этого действия.'
      });
    }
    next();
  };
};

// Middleware для проверки владельца документа
exports.checkDocumentOwnership = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Документ не найден.'
      });
    }

    // Проверяем, является ли пользователь владельцем документа или администратором
    if (document.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для доступа к этому документу.'
      });
    }

    req.document = document;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке прав доступа.'
    });
  }
}; 