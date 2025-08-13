#!/bin/bash

echo "🚀 Запуск MongoDB с веб-интерфейсом..."

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем, установлен ли Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Запускаем контейнеры
echo "🐳 Запуск MongoDB и Mongo Express..."
docker-compose up -d

# Ждем немного для инициализации
echo "⏳ Ожидание инициализации MongoDB..."
sleep 10

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "✅ MongoDB успешно запущена!"
echo ""
echo "🌐 Доступные сервисы:"
echo "   📊 MongoDB: mongodb://localhost:27017"
echo "   🖥️  Mongo Express (веб-интерфейс): http://localhost:8081"
echo "   👤 Логин: admin"
echo "   🔑 Пароль: password123"
echo ""
echo "🔗 Для приложения используйте:"
echo "   mongodb://gost_user:gost_password@localhost:27017/gost-formatter"
echo ""
echo "📝 Логи контейнеров:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Остановка:"
echo "   docker-compose down" 