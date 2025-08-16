-- Dashboard App Database Setup
-- Run this script after installing MySQL locally

-- Create database
CREATE DATABASE IF NOT EXISTS dashboard_app;
USE dashboard_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create posts table (example for dashboard content)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image_url VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create post_categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT,
    category_id INT,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('admin', 'admin@example.com', '$2b$10$example_hash', 'Admin', 'User'),
('john_doe', 'john@example.com', '$2b$10$example_hash', 'John', 'Doe');

INSERT INTO categories (name, description, color) VALUES
('Technology', 'Tech-related posts', '#007bff'),
('Business', 'Business and finance', '#28a745'),
('Design', 'UI/UX and design', '#dc3545');

-- Show tables created
SHOW TABLES;

-- Show table structures
DESCRIBE users;
DESCRIBE posts;
DESCRIBE categories;
