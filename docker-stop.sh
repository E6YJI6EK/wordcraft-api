#!/bin/bash

echo "🛑 Остановка MongoDB и Mongo Express..."

# Останавливаем контейнеры
docker-compose down

echo "✅ Контейнеры остановлены!"

# Показываем статус
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "💾 Данные MongoDB сохранены в Docker volume"
echo "🔄 Для полной очистки данных выполните:"
echo "   docker-compose down -v" 