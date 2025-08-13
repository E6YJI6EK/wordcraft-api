# GOST Document Formatter - Backend

Backend API для приложения форматирования документов по ГОСТу.

## Технологии

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT для аутентификации
- Multer для загрузки файлов
- Docx для работы с Word документами

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `config.env`:
```bash
cp config.env .env
```

3. Настройте переменные окружения в `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gost-formatter
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
NODE_ENV=development
```

4. Убедитесь, что MongoDB запущена

5. Запустите сервер:
```bash
# Режим разработки
npm run dev

# Продакшн режим
npm start
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя
- `GET /api/auth/me` - Получение данных текущего пользователя
- `PUT /api/auth/profile` - Обновление профиля
- `POST /api/auth/logout` - Выход

### Документы
- `GET /api/documents` - Получение всех документов пользователя
- `POST /api/documents` - Создание нового документа
- `POST /api/documents/upload` - Загрузка документа из файла
- `GET /api/documents/:id` - Получение документа по ID
- `PUT /api/documents/:id` - Обновление документа
- `DELETE /api/documents/:id` - Удаление документа
- `POST /api/documents/:id/duplicate` - Дублирование документа

### ГОСТ форматирование
- `POST /api/gost/format` - Форматирование документа по ГОСТ
- `POST /api/gost/export/:id` - Экспорт документа в DOCX
- `GET /api/gost/templates` - Получение доступных ГОСТ шаблонов
- `POST /api/gost/validate/:id` - Валидация документа на соответствие ГОСТ

## Поддерживаемые ГОСТ

- ГОСТ 7.32-2017 - Отчет о научно-исследовательской работе
- ГОСТ 7.1-2003 - Библиографическая запись
- ГОСТ 2.105-95 - Единая система конструкторской документации

## Структура проекта

```
backend/
├── models/          # Модели MongoDB
├── routes/          # API маршруты
├── middleware/      # Middleware функции
├── uploads/         # Загруженные файлы
├── config.env       # Конфигурация
├── server.js        # Основной файл сервера
└── package.json
``` 