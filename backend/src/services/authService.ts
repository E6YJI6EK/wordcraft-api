import { IUser } from "../types";
import User from "../models/User";

export class AuthService {
  // Поиск пользователя по email
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Поиск пользователя по email, исключая определенный ID
  async findUserByEmailExcludingId(
    email: string,
    userId: string
  ): Promise<IUser | null> {
    return await User.findOne({ email, _id: { $ne: userId } });
  }

  // Поиск пользователя по ID
  async findUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  // Создание нового пользователя
  async createUser(userData: {
    login: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    return await User.create(userData);
  }

  // Аутентификация пользователя
  async authenticateUser(
    email: string,
    password: string
  ): Promise<IUser | null> {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Обновление времени последнего входа
  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  // Обновление пользователя
  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Удаление пользователя
  async deleteUser(userId: string): Promise<void> {
    await User.findByIdAndDelete(userId);
  }

  // Получение всех пользователей (для админов)
  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).select("-password"),
      User.countDocuments(),
    ]);

    return { users, total };
  }

  // Изменение роли пользователя (для админов)
  async changeUserRole(
    userId: string,
    role: "user" | "admin"
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );
  }
}
