const db = require('./database/db');

const testCourses = [
  { 
    title: 'Python для начинающих', 
    price: 9900, 
    category: 'programming', 
    image_url: '/images/python.jpg' 
  },
  { 
    title: 'Линейная алгебра', 
    price: 7500, 
    category: 'math', 
    image_url: '/images/algebra.jpg' 
  }
];

// Вставляем тестовые данные
db.transaction(() => {
  const stmt = db.prepare(`
    INSERT INTO courses (title, price, category, image_url)
    VALUES (@title, @price, @category, @image_url)
  `);
  
  testCourses.forEach(course => stmt.run(course));
})();

console.log('✅ Тестовые курсы добавлены');
db.close();