import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthResponse, ApiResponse } from "../types";
import { AuthService } from "../services/authService";
import { catchAsync } from "../utils/errorHandler";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Генерация JWT токена
  private generateToken = (id: string): string => {
    const secret = process.env["JWT_SECRET"];

    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign({ id }, secret, {
      expiresIn: "30d",
    });
  };

  // @route   POST /api/auth/register
  // @desc    Регистрация нового пользователя
  // @access  Public
  register = catchAsync(async (req: Request, res: Response<AuthResponse>) => {
    const { login, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await this.authService.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Пользователь с таким email уже существует.",
      });
      return;
    }

    // Создаем нового пользователя
    const user = await this.authService.createUser({ login, email, password });

    // Генерируем токен
    const token = this.generateToken(user._id);

    res.status(201).cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Пользователь успешно зарегистрирован.",
      token,
      user: {
        id: user._id,
        name: user.login,
        email: user.email,
        role: user.role,
      },
    });
  });

  // @route   POST /api/auth/login
  // @desc    Вход пользователя
  // @access  Public
  login = catchAsync(async (req: Request, res: Response<AuthResponse>) => {
    const { email, password } = req.body;

    // Находим пользователя и проверяем пароль
    const user = await this.authService.authenticateUser(email, password);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Неверные учетные данные.",
      });
      return;
    }

    // Обновляем время последнего входа
    await this.authService.updateLastLogin(user._id);

    // Генерируем токен
    const token = this.generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.login,
      email: user.email,
      role: user.role,
    };

    if (user.avatarUrl) {
      (userResponse as any).avatar = user.avatarUrl;
    }
    res.cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Вход выполнен успешно.",
      token,
      user: userResponse,
    });
  });

  // @route   GET /api/auth/me
  // @desc    Получение данных текущего пользователя
  // @access  Private
  getMe = catchAsync(async (req: AuthRequest, res: Response<ApiResponse>) => {
    const user = await this.authService.findUserById(req.user!._id);

    res.json({
      success: true,
      data: {
        id: user!._id,
        name: user!.login,
        email: user!.email,
        role: user!.role,
        avatar: user!.avatarUrl,
      },
    });
  });

  // @route   PUT /api/auth/profile
  // @desc    Обновление профиля пользователя
  // @access  Private
  updateProfile = catchAsync(
    async (req: AuthRequest, res: Response<ApiResponse>) => {
      const { name, email } = req.body;
      const updateData: { name?: string; email?: string } = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;

      // Проверяем, не занят ли email другим пользователем
      if (email) {
        const existingUser = await this.authService.findUserByEmailExcludingId(
          email,
          req.user!._id
        );
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: "Пользователь с таким email уже существует.",
          });
          return;
        }
      }

      const user = await this.authService.updateUser(req.user!._id, updateData);

      res.json({
        success: true,
        message: "Профиль обновлен успешно.",
        data: {
          id: user!._id,
          name: user!.login,
          email: user!.email,
          role: user!.role,
          avatar: user!.avatarUrl,
        },
      });
    }
  );

  // @route   POST /api/auth/logout
  // @desc    Выход пользователя
  // @access  Private
  logout = (_req: Request, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      message: "Выход выполнен успешно.",
    });
  };
}
