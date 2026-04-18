const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'xiaomi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接成功');
        connection.release();
        return true;
    } catch (error) {
        console.error('数据库连接失败:', error.message);
        return false;
    }
}

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS article_likes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            article_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_article_user (article_id, user_id),
            INDEX idx_article (article_id),
            INDEX idx_user (user_id),
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Article likes';
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS announcements (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(200) NOT NULL COMMENT 'Announcement title',
            content VARCHAR(1000) NULL COMMENT 'Announcement content',
            type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info' COMMENT 'Type',
            link VARCHAR(255) NULL COMMENT 'Optional link URL',
            link_text VARCHAR(50) NULL COMMENT 'Optional link text',
            status TINYINT DEFAULT 1 COMMENT '1-show, 0-hide',
            sort_order INT DEFAULT 0 COMMENT 'Sort order',
            start_time TIMESTAMP NULL COMMENT 'Start time',
            end_time TIMESTAMP NULL COMMENT 'End time',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Announcements table';
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS friend_links (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL UNIQUE,
            logo VARCHAR(255),
            description VARCHAR(255),
            status TINYINT DEFAULT 0,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(100) NOT NULL UNIQUE,
            ip VARCHAR(64),
            status TINYINT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
}

module.exports = { pool, testConnection, ensureSchema };
