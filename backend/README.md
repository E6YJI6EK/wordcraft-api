# GOST Document Formatter Backend (TypeScript + MVC)

Backend API для приложения форматирования документов по ГОСТу, написанный на TypeScript с использованием Express.js, MongoDB, Zod для валидации и архитектуры MVC.

## 🚀 Особенности

- **TypeScript** - Полная типизация кода
- **MVC Architecture** - Четкое разделение ответственности
- **Zod валидация** - Строгая валидация входных данных
- **JWT аутентификация** - Безопасная аутентификация пользователей
- **MongoDB** - NoSQL база данных с Mongoose ODM
- **Express.js** - Веб-фреймворк для Node.js
- **Multer** - Обработка загрузки файлов
- **DOCX** - Экспорт документов в формате Word
- **CORS** - Поддержка кросс-доменных запросов
- **Graceful shutdown** - Корректное завершение работы сервера

## 📋 Требования

- Node.js 18+ 
- MongoDB 5+
- npm или yarn

## 🛠 Установка

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd wordcraft-api/backend
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Настройте переменные окружения:**
Создайте файл `config.env` в корне папки backend:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wordcraft
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
NODE_ENV=development
```

4. **Соберите проект:**
```bash
npm run build
```

## 🚀 Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

### Сборка в режиме наблюдения
```bash
npm run watch
```

## 📁 Структура проекта (MVC)

```
src/
├── controllers/     # Контроллеры (Controller)
│   ├── authController.ts      # Контроллер аутентификации
│   ├── documentController.ts  # Контроллер документов
│   └── gostController.ts      # Контроллер ГОСТ форматирования
├── services/        # Бизнес-логика (Service Layer)
│   ├── authService.ts         # Сервис аутентификации
│   ├── documentService.ts     # Сервис документов
│   └── gostService.ts         # Сервис ГОСТ форматирования
├── models/          # Модели данных (Model)
│   ├── User.ts      # Модель пользователя
│   └── Document.ts  # Модель документа
├── routes/          # Маршруты (Routes)
│   ├── auth.ts      # Роуты аутентификации
│   ├── documents.ts # Роуты документов
│   └── gost.ts      # Роуты ГОСТ
├── middleware/      # Middleware
│   ├── auth.ts      # Аутентификация
│   └── validation.ts # Валидация Zod
├── validations/     # Схемы валидации Zod
│   └── index.ts     # Все схемы валидации
├── types/          # TypeScript типы
│   └── index.ts    # Основные типы
├── utils/          # Утилиты
│   └── errorHandler.ts # Обработка ошибок
└── server.ts       # Основной файл сервера
```

## 🏗 Архитектура MVC

### Model (Модель)
- **User.ts** - Модель пользователя с Mongoose схемой
- **Document.ts** - Модель документа с Mongoose схемой
- Отвечает за структуру данных и взаимодействие с базой данных

### View (Представление)
- В API контексте - это JSON ответы
- Контроллеры формируют структурированные ответы
- Валидация обеспечивает корректность данных

### Controller (Контроллер)
- **AuthController** - Обработка запросов аутентификации
- **DocumentController** - Обработка запросов документов
- **GostController** - Обработка запросов ГОСТ форматирования
- Принимает HTTP запросы, вызывает сервисы, возвращает ответы

### Service Layer (Слой сервисов)
- **AuthService** - Бизнес-логика аутентификации
- **DocumentService** - Бизнес-логика работы с документами
- **GostService** - Бизнес-логика ГОСТ форматирования
- Содержит основную логику приложения

## 🔐 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя
- `GET /api/auth/me` - Получение данных пользователя
- `PUT /api/auth/profile` - Обновление профиля
- `POST /api/auth/logout` - Выход

### Документы
- `GET /api/documents` - Получение документов пользователя
- `POST /api/documents` - Создание документа
- `POST /api/documents/upload` - Загрузка документа из файла
- `GET /api/documents/:id` - Получение документа по ID
- `PUT /api/documents/:id` - Обновление документа
- `DELETE /api/documents/:id` - Удаление документа
- `POST /api/documents/:id/duplicate` - Дублирование документа

### ГОСТ форматирование
- `POST /api/gost/format` - Форматирование документа по ГОСТ
- `POST /api/gost/export/:id` - Экспорт в DOCX
- `GET /api/gost/templates` - Получение шаблонов ГОСТ
- `POST /api/gost/validate/:id` - Валидация документа

### Системные
- `GET /api/health` - Проверка состояния сервера
- `GET /api` - Информация об API

## 🔒 Валидация

Все входные данные валидируются с помощью Zod:

### Регистрация пользователя
```typescript
{
  name: string (2-50 символов),
  email: string (валидный email),
  password: string (6-100 символов, с буквами и цифрами)
}
```

### Создание документа
```typescript
{
  title: string (1-200 символов),
  type: 'coursework' | 'thesis' | 'report' | 'essay',
  content?: string,
  gostFormat?: 'gost-7.32-2017' | 'gost-7.1-2003' | 'gost-2.105-95',
  settings?: {
    fontSize: number (8-72),
    lineSpacing: number (1-3),
    margins: { top, bottom, left, right },
    fontFamily: string
  },
  metadata?: {
    author?: string,
    supervisor?: string,
    department?: string,
    year?: number (2000-текущий+1),
    subject?: string,
    keywords?: string[]
  }
}
```

## 🗄 База данных

### Пользователи (Users)
- email (уникальный)
- password (хешированный)
- name
- role (user/admin)
- avatar
- createdAt
- lastLogin

### Документы (Documents)
- title
- type
- content
- gostFormat
- settings
- metadata
- originalFile
- status
- version
- user (ссылка на User)
- isPublic
- tags
- createdAt
- updatedAt

## 🛡 Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Валидация всех входных данных
- Проверка прав доступа к документам
- CORS настройки
- Ограничение размера файлов

## 📝 Логирование

Сервер логирует:
- Подключение к базе данных
- Запуск сервера
- Ошибки аутентификации
- Ошибки валидации
- Graceful shutdown

## 🐳 Docker

Для запуска в Docker:

```bash
# Сборка образа
docker build -t wordcraft-backend .

# Запуск контейнера
docker run -p 5000:5000 wordcraft-backend
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage
```

## 📊 Мониторинг

- Health check endpoint: `/api/health`
- Логирование ошибок
- Graceful shutdown
- Обработка необработанных ошибок

## 🔄 Преимущества MVC архитектуры

1. **Разделение ответственности** - Каждый компонент имеет свою роль
2. **Переиспользование кода** - Сервисы можно использовать в разных контроллерах
3. **Тестируемость** - Легко тестировать каждый слой отдельно
4. **Масштабируемость** - Легко добавлять новые функции
5. **Поддерживаемость** - Код организован и понятен

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License 