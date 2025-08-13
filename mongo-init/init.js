// Скрипт инициализации MongoDB для ГОСТ Document Formatter
db = db.getSiblingDB('gost-formatter');

// Создаем пользователя для приложения
db.createUser({
  user: 'gost_user',
  pwd: 'gost_password',
  roles: [
    {
      role: 'readWrite',
      db: 'gost-formatter'
    }
  ]
});

// Создаем коллекции
db.createCollection('users');
db.createCollection('documents');

// Создаем индексы для оптимизации
db.users.createIndex({ "email": 1 }, { unique: true });
db.documents.createIndex({ "user": 1, "createdAt": -1 });
db.documents.createIndex({ "title": "text", "metadata.subject": "text" });

print('✅ MongoDB инициализирована для ГОСТ Document Formatter');
print('📊 База данных: gost-formatter');
print('👤 Пользователь: gost_user');
print('🔗 Подключение: mongodb://gost_user:gost_password@localhost:27017/gost-formatter'); 