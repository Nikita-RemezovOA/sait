const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

// Инициализация
const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_very_secret_key_123'; // Замените на реальный секрет

// Подключение к SQLite
const dbPath = path.resolve(__dirname, 'backend/data/courses.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('foreign_keys = ON');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Валидация email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Хеширование пароля (упрощенный пример - в продакшене используйте bcrypt)
function hashPassword(password) {
    return password + '_hashed'; // Замените на реальное хеширование
}

// ===================== API Endpoints ===================== //

// Регистрация
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Некорректный email' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    try {
        // Проверка существующего пользователя
        const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (userExists) {
            return res.status(409).json({ error: 'Email уже занят' });
        }

        // Создание пользователя
        const hashedPassword = hashPassword(password);
        const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
        const info = stmt.run(email, hashedPassword);

        // Генерация токена
        const token = jwt.sign({ userId: info.lastInsertRowid }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({
            success: true,
            token,
            user: { id: info.lastInsertRowid, email }
        });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    try {
        // Находим пользователя
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Проверка пароля (упрощенная - замените на bcrypt.compare)
        if (hashPassword(password) !== user.password_hash) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Генерация токена
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение курсов
app.get('/api/courses', (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM courses';
        let params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        const courses = db.prepare(query).all(params);
        res.json(courses);
    } catch (err) {
        console.error('Ошибка получения курсов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Middleware для проверки авторизации
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
}

// Защищенный маршрут (пример)
app.get('/api/user/profile', authenticate, (req, res) => {
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.userId);
    res.json(user);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    initDatabase();
});

// Инициализация БД
function initDatabase() {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                price INTEGER NOT NULL,
                category TEXT NOT NULL,
                image_url TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (course_id) REFERENCES courses(id)
            );
        `);
        console.log('База данных инициализирована');
    } catch (err) {
        console.error('Ошибка инициализации БД:', err);
    }
}

