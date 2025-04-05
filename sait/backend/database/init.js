const db = require('./db');
const fs = require('fs');
const path = require('path');

// Читаем SQL-файл миграции
const sqlPath = path.resolve(__dirname, '../migrations/001_init.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Выполняем SQL
db.exec(sql);
console.log('✅ Таблицы созданы');

// Закрываем соединение
db.close();