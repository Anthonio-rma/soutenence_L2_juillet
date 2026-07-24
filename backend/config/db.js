const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'taxi_be_db',
  waitForConnections: true,
  connectionLimit:    3,          // ⚠️ FreeSQLDatabase limite à ~4-5 connexions max
  queueLimit:         0,
  timezone: '+03:00',
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  idleTimeout:        60000,      // libère les connexions inactives après 60s
  maxIdle:            2,          // garde au max 2 connexions "au repos"
});

// Test de connexion au démarrage
db.getConnection()
  .then(conn => {
    console.log("Connecté à MySQL");
    conn.release();
  })
  .catch(err => {
    console.error("Erreur de connexion BDD :", err);
    process.exit(1);
  });

module.exports = db;