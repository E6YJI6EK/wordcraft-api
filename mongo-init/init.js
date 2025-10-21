// Скрипт инициализации MongoDB 
// ВАЖНО!!1 ЭТОТ ФАЙЛ ДОЛЖЕН ВСЕГДА
// ГЕНЕРИРОВАТЬСЯ НА СЕРВЕРЕ
// ЕГО НЕ ДОЛЖНО БЫТЬ В РЕПОЗИТОРИИ
db = db.getSiblingDB("wordcraft-db");
// Создаем пользователя для приложения
db.createUser({
  user: "wordcraft_user",
  pwd: "wordcraft_password",
  roles: [
    {
      role: "readWrite",
      db: "wordcraft-db",
    },
  ],
});

db.createCollection("config");
db.config.insertOne({
  app_name: "WordcraftDB",
  version: "1.0.0",
  initialized: true,
  created_at: new Date(),
});

print("✅ MongoDB инициализирована для Wordcraft API");
