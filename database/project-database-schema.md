# 项目数据库完整 SQL 指令

```sql
-- 初始化编码
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS xiaomi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xiaomi;

ame',
    password VARCHAR(255) NOT NULL COMMENT 'Password (encrypted)',
    email VARCHAR(100) UNIQUE COMMENT 'Email',
    nickname VARCHAR(50) COMMENT 'Nickname',
    avatar VARCHAR(255) COMMENT 'Avatar URL',
    role ENUM('admin', 'user') DEFAULT 'user' COMMENT 'Role',
    status TINYINT DEFAULT 1 COMMENT '1-active, 0-disabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Users table';

-- 邮箱验证码
CREATE TABLE IF NOT EXISTS email_verify_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Email verify codes';

-- 微信绑定
CREATE TABLE IF NOT EXISTS wechat_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    openid VARCHAR(64) NOT NULL,
    unionid VARCHAR(64),
    nickname VARCHAR(100),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_openid (openid),
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='WeChat user bindings';

-- 分类
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Category name',
    description VARCHAR(255) COMMENT 'Category description',
    sort_order INT DEFAULT 0 COMMENT 'Sort order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Categories table';

-- 标签
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tag name',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tags table';

-- 文章
CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT 'Article title',
    content LONGTEXT NOT NULL COMMENT 'Article content',
    summary VARCHAR(500) COMMENT 'Article summary',
    cover_image VARCHAR(255) COMMENT 'Cover image URL',
    category_id INT COMMENT 'Category ID',
    author_id INT NOT NULL COMMENT 'Author ID',
    view_count INT DEFAULT 0 COMMENT 'View count',
    like_count INT DEFAULT 0 COMMENT 'Like count',
    status ENUM('draft', 'published', 'deleted') DEFAULT 'draft' COMMENT 'Status',
    is_top TINYINT DEFAULT 0 COMMENT 'Is pinned: 1-yes, 0-no',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL COMMENT 'Published time',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Articles table';

-- 评论
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT,
    nickname VARCHAR(50),
    email VARCHAR(100),
    content TEXT NOT NULL,
    parent_id INT DEFAULT NULL,
    status TINYINT DEFAULT 1 COMMENT '1-show, 0-hide',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Comments table';

-- 点赞
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

-- 用户资料
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    real_name VARCHAR(50),
    gender ENUM('male', 'female', 'other', 'secret') DEFAULT 'secret',
    birthday DATE,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User profiles table';

-- 文章-标签关系
CREATE TABLE IF NOT EXISTS article_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    UNIQUE KEY unique_article_tag (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Article tags relation';

-- 公告
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

-- 友链
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

-- 站点配置
CREATE TABLE IF NOT EXISTS site_config (
    id INT PRIMARY KEY AUTO_INCREMENT-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Usern,
    config_key VARCHAR(50) NOT NULL UNIQUE COMMENT 'Config key',
    config_value TEXT COMMENT 'Config value',
    description TEXT COMMENT 'Description',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Site config table';

-- 订阅
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    ip VARCHAR(64),
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sub_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Email subscriptions';

-- 可选：初始化部分数据
INSERT INTO users (username, password, email, nickname, role, status) VALUES
('admin', '$2b$10$cfJCE2G71SpsFeAc41AupOT3ShOt5hMYj9gYvdMhDs9P2pyLZHEx2', 'admin@example.com', 'Admin', 'admin', 1)
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO categories (name, description, sort_order) VALUES
('Technology', 'Technology articles', 1),
('Life', 'Life articles', 2),
('Notes', 'Study notes', 3)
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO site_config (config_key, config_value, description) VALUES
('site_name', 'My Blog', 'Site name'),
('site_description', 'A simple personal blog', 'Site description'),
('author_name', 'Blogger', 'Author name'),
('author_intro', 'Love technology, love life', 'Author intro'),
('author_avatar', '', 'Author avatar'),
('contact_email', 'admin@example.com', 'Contact email'),
('contact_github', '', 'GitHub URL'),
('contact_wechat', '', 'WeChat'),
('icp_number', '', 'ICP number')
ON DUPLICATE KEY UPDATE config_key = config_key;

-- 索引
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_created ON articles(created_at);
```

