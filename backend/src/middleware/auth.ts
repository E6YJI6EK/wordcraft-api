import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import User from '../models/User';

interface JwtPayload {
  id: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Проверяем заголовок Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Токен не предоставлен.'
      });
      return;
    }

    try {
      // Верифицируем токен
      const secret = process.env['JWT_SECRET'];
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }
      
      const decoded = jwt.verify(token, secret) as JwtPayload;
      
      // Находим пользователя
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Токен недействителен. Пользователь не найден.'
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Токен недействителен.'
      });
      return;
    }
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при аутентификации.'
    });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Пользователь не аутентифицирован.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Недостаточно прав.'
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const secret = process.env['JWT_SECRET'];
        if (secret) {
          const decoded = jwt.verify(token, secret) as JwtPayload;
          const user = await User.findById(decoded.id).select('-password');
          
          if (user) {
            req.user = user;
          }
        }
      } catch (error) {
        // Игнорируем ошибки токена для опциональной аутентификации
      }
    }

    next();
  } catch (error) {
    console.error('Ошибка опциональной аутентификации:', error);
    next();
  }
}; 