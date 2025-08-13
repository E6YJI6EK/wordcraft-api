# 📝 ГОСТ Document Formatter

Полноценное веб-приложение для форматирования документов по российским стандартам ГОСТ. Позволяет создавать, редактировать и форматировать курсовые, дипломные работы и рефераты в соответствии с требованиями ГОСТ.

## 🚀 Возможности

- **🔐 Аутентификация пользователей** - Регистрация, вход и управление профилем
- **📝 WYSIWYG редактор** - Редактирование документов как в Microsoft Word
- **📁 Загрузка файлов** - Поддержка форматов DOC, DOCX, TXT
- **🎨 ГОСТ форматирование** - Автоматическое форматирование по стандартам:
  - ГОСТ 7.32-2017 - Отчет о научно-исследовательской работе
  - ГОСТ 7.1-2003 - Библиографическая запись
  - ГОСТ 2.105-95 - Единая система конструкторской документации
- **✅ Валидация** - Проверка соответствия документа требованиям ГОСТ
- **📤 Экспорт** - Сохранение документов в формате DOCX
- **📱 Адаптивный дизайн** - Работает на всех устройствах

## 🛠 Технологии

### Backend
- **Node.js** - Серверная платформа
- **Express.js** - Веб-фреймворк
- **MongoDB** - База данных
- **Mongoose** - ODM для MongoDB
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов
- **Docx** - Работа с Word документами

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - Типизированный JavaScript
- **Material-UI** - Компонентная библиотека
- **React Router** - Маршрутизация
- **Axios** - HTTP клиент
- **React Quill** - WYSIWYG редактор

## 📦 Установка и запуск

### Предварительные требования
- Node.js (версия 16 или выше)
- MongoDB
- npm или yarn

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd gost-document-formatter
```

### 2. Настройка Backend
```bash
cd backend
npm install
cp config.env .env
# Отредактируйте .env файл с вашими настройками
npm run dev
```

### 3. Настройка Frontend
```bash
cd frontend
npm install
# Создайте .env файл с REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### 4. Запуск MongoDB
Убедитесь, что MongoDB запущена и доступна по адресу `mongodb://localhost:27017`

## 🌐 Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API документация**: http://localhost:5000/api/health

## 📁 Структура проекта

```
gost-document-formatter/
├── backend/                 # Backend приложение
│   ├── models/             # Модели MongoDB
│   ├── routes/             # API маршруты
│   ├── middleware/         # Middleware функции
│   ├── uploads/            # Загруженные файлы
│   ├── server.js           # Основной файл сервера
│   └── package.json
├── frontend/               # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   ├── context/        # React контексты
│   │   ├── types/          # TypeScript типы
│   │   └── App.tsx         # Главный компонент
│   └── package.json
└── README.md
```

## 🔧 Конфигурация

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gost-formatter
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получение профиля
- `PUT /api/auth/profile` - Обновление профиля

### Документы
- `GET /api/documents` - Список документов
- `POST /api/documents` - Создание документа
- `POST /api/documents/upload` - Загрузка файла
- `GET /api/documents/:id` - Получение документа
- `PUT /api/documents/:id` - Обновление документа
- `DELETE /api/documents/:id` - Удаление документа

### ГОСТ форматирование
- `POST /api/gost/format` - Форматирование по ГОСТ
- `POST /api/gost/export/:id` - Экспорт в DOCX
- `GET /api/gost/templates` - ГОСТ шаблоны
- `POST /api/gost/validate/:id` - Валидация документа

## 🎯 Использование

1. **Регистрация/Вход** - Создайте аккаунт или войдите в систему
2. **Создание документа** - Создайте новый документ или загрузите существующий
3. **Редактирование** - Используйте WYSIWYG редактор для редактирования
4. **ГОСТ форматирование** - Выберите нужный ГОСТ и примените форматирование
5. **Валидация** - Проверьте соответствие документа требованиям
6. **Экспорт** - Сохраните документ в формате DOCX

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте документацию в папках `backend/README.md` и `frontend/README.md`
2. Создайте Issue в репозитории
3. Обратитесь к разработчикам

## 🚀 Развертывание

### Backend (Production)
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

### Frontend (Production)
```bash
cd frontend
npm run build
# Разместите содержимое build/ на вашем веб-сервере
```

## 📊 Статус проекта

- ✅ Backend API
- ✅ Frontend UI
- ✅ Аутентификация
- ✅ Базовое редактирование документов
- 🔄 WYSIWYG редактор (в разработке)
- 🔄 ГОСТ форматирование (в разработке)
- 🔄 Экспорт документов (в разработке)

---

**Создано с ❤️ для студентов и преподавателей** 