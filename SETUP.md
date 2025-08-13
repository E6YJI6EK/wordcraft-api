# 🚀 Инструкции по запуску ГОСТ Document Formatter

## Быстрый старт

### 1. Предварительные требования

Убедитесь, что у вас установлены:
- Node.js (версия 16 или выше)
- MongoDB
- npm или yarn

### 2. Установка MongoDB

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### macOS (с Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Windows:
Скачайте и установите MongoDB с официального сайта: https://www.mongodb.com/try/download/community

### 3. Запуск приложения

#### Шаг 1: Запуск Backend
```bash
cd backend
npm install
cp config.env .env
npm run dev
```

Backend будет доступен по адресу: http://localhost:5000

#### Шаг 2: Запуск Frontend
```bash
cd frontend
npm install
npm start
```

Frontend будет доступен по адресу: http://localhost:3000

### 4. Проверка работы

1. Откройте браузер и перейдите на http://localhost:3000
2. Вы должны увидеть главную страницу приложения
3. Попробуйте зарегистрироваться или войти в систему

## 🔧 Конфигурация

### Backend (.env файл)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gost-formatter
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
NODE_ENV=development
```

### Frontend (.env файл)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🐛 Устранение неполадок

### Backend не запускается
1. Проверьте, что MongoDB запущена:
   ```bash
   sudo systemctl status mongodb
   ```
2. Проверьте, что порт 5000 свободен:
   ```bash
   lsof -i :5000
   ```
3. Проверьте логи в терминале

### Frontend не запускается
1. Проверьте, что порт 3000 свободен:
   ```bash
   lsof -i :3000
   ```
2. Убедитесь, что все зависимости установлены:
   ```bash
   npm install
   ```

### Проблемы с подключением к API
1. Проверьте, что backend запущен на порту 5000
2. Проверьте файл .env в frontend папке
3. Проверьте CORS настройки в backend

## 📝 Тестирование API

### Проверка здоровья API
```bash
curl http://localhost:5000/api/health
```

### Регистрация пользователя
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовый пользователь",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Вход в систему
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🚀 Продакшн развертывание

### Backend
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Разместите содержимое build/ на вашем веб-сервере
```

## 📊 Мониторинг

### Логи Backend
Логи выводятся в консоль. Для продакшена рекомендуется использовать PM2 или аналогичные инструменты.

### Логи Frontend
Логи доступны в консоли браузера (F12 -> Console).

## 🔒 Безопасность

### Для продакшена обязательно:
1. Измените JWT_SECRET на сложный ключ
2. Настройте HTTPS
3. Ограничьте CORS настройки
4. Настройте rate limiting
5. Используйте переменные окружения для секретов

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте логи в терминале
2. Убедитесь, что все зависимости установлены
3. Проверьте версии Node.js и MongoDB
4. Создайте Issue в репозитории проекта 