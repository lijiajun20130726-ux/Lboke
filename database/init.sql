-- Blog System Database Init Script
-- Database: xiaomi

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database
CREATE DATABASE IF NOT EXISTS xiaomi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xiaomi;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username',
    password VARCHAR(255) NOT NULL COMMENT 'Password (encrypted)',
    email VARCHAR(100) UNIQUE COMMENT 'Email',
    nickname VARCHAR(50) COMMENT 'Nickname',
    avatar VARCHAR(255) COMMENT 'Avatar URL',
    role ENUM('admin', 'user') DEFAULT 'user' COMMENT 'Role: admin or user',
    status TINYINT DEFAULT 1 COMMENT 'Status: 1-active, 0-disabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Users table';

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Category name',
    description VARCHAR(255) COMMENT 'Category description',
    sort_order INT DEFAULT 0 COMMENT 'Sort order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Categories table';

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tag name',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tags table';

-- Articles table
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

-- Comments table
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

-- User profiles table
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

-- Article-Tags relation table
CREATE TABLE IF NOT EXISTS article_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    UNIQUE KEY unique_article_tag (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Article tags relation';

-- Site config table
CREATE TABLE IF NOT EXISTS site_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(50) NOT NULL UNIQUE COMMENT 'Config key',
    config_value TEXT COMMENT 'Config value',
    description VARCHAR(100) COMMENT 'Config description',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Site config table';

-- Insert default site config
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

-- Insert default admin user (username: admin, password: admin123)
-- Password is bcrypt hashed admin123
INSERT INTO users (username, password, email, nickname, role, status) VALUES
('admin', '$2b$10$cfJCE2G71SpsFeAc41AupOT3ShOt5hMYj9gYvdMhDs9P2pyLZHEx2', 'admin@example.com', 'Admin', 'admin', 1)
ON DUPLICATE KEY UPDATE username = username;

-- Insert default categories
INSERT INTO categories (name, description, sort_order) VALUES
('Technology', 'Technology articles', 1),
('Life', 'Life articles', 2),
('Notes', 'Study notes', 3)
ON DUPLICATE KEY UPDATE name = name;

-- Create indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_created ON articles(created_at);
