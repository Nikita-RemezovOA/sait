const Database = require('better-sqlite3');
const path = require('path');

// Путь к файлу БД (создастся автоматически)
const dbPath = path.resolve(__dirname, '../Data/courses.db'); 

// Подключаемся к SQLite
const db = new Database(dbPath, { 
  verbose: console.log // Логирование запросов
});

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

module.exports = db;