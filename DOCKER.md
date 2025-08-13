# 🐳 Docker для ГОСТ Document Formatter

Этот документ описывает, как запустить MongoDB с веб-интерфейсом используя Docker.

## 🚀 Быстрый старт

### Предварительные требования

Убедитесь, что у вас установлены:
- Docker
- Docker Compose

### Установка Docker

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Перезапустите терминал или выполните: newgrp docker
```

#### macOS:
```bash
# Установите Docker Desktop с официального сайта
# https://www.docker.com/products/docker-desktop
```

#### Windows:
Скачайте и установите Docker Desktop с официального сайта.

## 🏃‍♂️ Запуск

### Автоматический запуск
```bash
./docker-start.sh
```

### Ручной запуск
```bash
# Запуск контейнеров
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 🛑 Остановка

### Автоматическая остановка
```bash
./docker-stop.sh
```

### Ручная остановка
```bash
# Остановка контейнеров
docker-compose down

# Остановка с удалением данных
docker-compose down -v
```

## 🌐 Доступ к сервисам

После запуска будут доступны:

### MongoDB
- **URL**: `mongodb://localhost:27017`
- **База данных**: `gost-formatter`
- **Пользователь**: `gost_user`
- **Пароль**: `gost_password`
- **Полная строка подключения**: `mongodb://gost_user:gost_password@localhost:27017/gost-formatter`

### Mongo Express (веб-интерфейс)
- **URL**: http://localhost:8081
- **Логин**: `admin`
- **Пароль**: `password123`

## 📊 Использование Mongo Express

1. Откройте браузер и перейдите на http://localhost:8081
2. Войдите используя логин `admin` и пароль `password123`
3. Выберите базу данных `gost-formatter`
4. Просматривайте и редактируйте коллекции:
   - `users` - пользователи приложения
   - `documents` - документы пользователей

### Возможности Mongo Express:
- 📋 Просмотр коллекций и документов
- ✏️ Редактирование документов
- 🔍 Поиск по документам
- 📊 Статистика базы данных
- 🗑️ Удаление документов
- 📤 Экспорт данных

## 🔧 Конфигурация

### Переменные окружения

В `docker-compose.yml` настроены следующие переменные:

#### MongoDB:
- `MONGO_INITDB_ROOT_USERNAME`: admin
- `MONGO_INITDB_ROOT_PASSWORD`: password123
- `MONGO_INITDB_DATABASE`: gost-formatter

#### Mongo Express:
- `ME_CONFIG_MONGODB_ADMINUSERNAME`: admin
- `ME_CONFIG_MONGODB_ADMINPASSWORD`: password123
- `ME_CONFIG_BASICAUTH_USERNAME`: admin
- `ME_CONFIG_BASICAUTH_PASSWORD`: password123

### Изменение конфигурации

1. Отредактируйте `docker-compose.yml`
2. Обновите `backend/config.env` с новыми данными подключения
3. Перезапустите контейнеры:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## 📝 Логи и отладка

### Просмотр логов
```bash
# Все контейнеры
docker-compose logs

# Конкретный сервис
docker-compose logs mongodb
docker-compose logs mongo-express

# Логи в реальном времени
docker-compose logs -f
```

### Подключение к MongoDB
```bash
# Подключение к контейнеру
docker exec -it gost-mongodb mongosh

# Подключение с аутентификацией
docker exec -it gost-mongodb mongosh -u admin -p password123
```

## 🗂️ Структура данных

### База данных: gost-formatter

#### Коллекция: users
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Коллекция: documents
```javascript
{
  _id: ObjectId,
  title: String,
  type: String,
  content: String,
  gostFormat: String,
  settings: Object,
  metadata: Object,
  user: ObjectId,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Безопасность

### Для продакшена:
1. Измените пароли в `docker-compose.yml`
2. Обновите `backend/config.env`
3. Используйте переменные окружения
4. Настройте SSL/TLS
5. Ограничьте доступ к портам

### Пример безопасной конфигурации:
```yaml
environment:
  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
  ME_CONFIG_BASICAUTH_PASSWORD: ${MONGO_EXPRESS_PASSWORD}
```

## 🐛 Устранение неполадок

### Контейнеры не запускаются
```bash
# Проверьте статус Docker
sudo systemctl status docker

# Проверьте логи
docker-compose logs

# Перезапустите Docker
sudo systemctl restart docker
```

### MongoDB не доступна
```bash
# Проверьте статус контейнеров
docker-compose ps

# Проверьте порты
netstat -tlnp | grep 27017

# Перезапустите контейнеры
docker-compose restart
```

### Mongo Express не доступен
```bash
# Проверьте логи Mongo Express
docker-compose logs mongo-express

# Проверьте подключение к MongoDB
docker exec -it gost-mongodb mongosh -u admin -p password123
```

## 📚 Полезные команды

```bash
# Очистка всех данных
docker-compose down -v
docker volume prune

# Обновление образов
docker-compose pull
docker-compose up -d

# Резервное копирование
docker exec gost-mongodb mongodump --out /backup

# Восстановление
docker exec gost-mongodb mongorestore /backup
```

## 🎯 Интеграция с приложением

После запуска Docker контейнеров:

1. **Backend** автоматически подключится к MongoDB
2. **Frontend** будет работать как обычно
3. Используйте Mongo Express для просмотра данных

### Проверка подключения:
```bash
# Проверьте API
curl http://localhost:5000/api/health

# Проверьте MongoDB
docker exec -it gost-mongodb mongosh -u gost_user -p gost_password gost-formatter
``` 