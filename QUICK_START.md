# 🚀 Быстрый старт ГОСТ Document Formatter

## 📋 Что нужно сделать

### 1. Запуск MongoDB с веб-интерфейсом
```bash
./docker-start.sh
```

### 2. Запуск Backend
```bash
cd backend
npm run dev
```

### 3. Запуск Frontend
```bash
cd frontend
npm start
```

## 🌐 Доступные сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| **Frontend** | http://localhost:3000 | Главное приложение |
| **Backend API** | http://localhost:5000/api | REST API |
| **Mongo Express** | http://localhost:8081 | Веб-интерфейс для MongoDB |

## 🔐 Данные для входа

### Mongo Express (веб-интерфейс MongoDB)
- **URL**: http://localhost:8081
- **Логин**: `admin`
- **Пароль**: `password123`

### Тестовый пользователь приложения
- **Email**: `test@example.com`
- **Пароль**: `password123`

## 📊 Что можно посмотреть

### В Mongo Express (http://localhost:8081):
1. Войдите с логином `admin` и паролем `password123`
2. Выберите базу данных `gost-formatter`
3. Просмотрите коллекции:
   - `users` - зарегистрированные пользователи
   - `documents` - документы пользователей

### В приложении (http://localhost:3000):
1. Зарегистрируйтесь или войдите с тестовыми данными
2. Создавайте и редактируйте документы
3. Применяйте ГОСТ форматирование

## 🛑 Остановка

```bash
# Остановка MongoDB
./docker-stop.sh

# Остановка Backend и Frontend
# Нажмите Ctrl+C в соответствующих терминалах
```

## 🔧 Полезные команды

```bash
# Проверка статуса контейнеров
docker-compose ps

# Просмотр логов MongoDB
docker-compose logs mongodb

# Просмотр логов Mongo Express
docker-compose logs mongo-express

# Подключение к MongoDB
docker exec -it gost-mongodb mongosh -u gost_user -p gost_password gost-formatter

# Тестирование API
curl http://localhost:5000/api/health
```

## 🐛 Если что-то не работает

1. **MongoDB не запускается**: Проверьте, что Docker установлен и запущен
2. **Backend не подключается**: Убедитесь, что MongoDB запущена и порт 27017 свободен
3. **Frontend не загружается**: Проверьте, что Backend работает на порту 5000
4. **Mongo Express недоступен**: Проверьте логи `docker-compose logs mongo-express`

## 📚 Дополнительная документация

- [README.md](README.md) - Полное описание проекта
- [DOCKER.md](DOCKER.md) - Подробная документация по Docker
- [SETUP.md](SETUP.md) - Инструкции по установке
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Описание созданного проекта 