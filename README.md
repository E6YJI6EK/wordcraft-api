# 📝 Wordcraft API

Полноценное веб-приложение для форматирования документов по российским стандартам ГОСТ. Позволяет создавать, редактировать и форматировать курсовые, дипломные работы и рефераты в соответствии с требованиями ГОСТ.

## 🚀 Возможности
- **📝 WYSIWYG редактор** - Редактирование документов как в Microsoft Word
- **📁 Загрузка файлов** - Поддержка форматов DOC, DOCX, TXT
- **🎨 ГОСТ форматирование** - Автоматическое форматирование по ГОСТ
- **📤 Экспорт** - Сохранение документов в формате DOCX

## 📦 Установка и запуск

### Предварительные требования
- Node.js (версия 16 или выше)
- Docker
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

### 3. Запуск MongoDB через docker
```
sh docker-start.sh
```

## 🌐 Доступ к приложению
- **Backend API**: http://localhost:5000/api
- **API документация**: http://localhost:5000/api/health

## 🔧 Конфигурация

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gost-formatter
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
NODE_ENV=development
```

## 🚀 Развертывание

### Backend (Production)
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

## 📊 Статус проекта

- ✅ Backend API
- ✅ Frontend UI
- ✅ Аутентификация
- ✅ Базовое редактирование документов
- 🔄 WYSIWYG редактор (в разработке)
- 🔄 ГОСТ форматирование (в разработке)
- 🔄 Экспорт документов (в разработке)
