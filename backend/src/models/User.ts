import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Пожалуйста, введите корректный email']
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    select: false
  },
  login: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  avatarUrl: {
    type: String,
    default: null
  },
}, {
  timestamps: true
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Метод для проверки пароля
userSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this['password']);
};

// Индексы
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model<UserDocument>('User', userSchema, 'Users');

export default User; 