{
  "name": "sait",
  "version": "1.0.0",
  "scripts": {
    "start": "node backend/server.js",
    "init-db": "node backend/database/init.js",
    "seed": "node backend/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^8.6.0"
  }
}