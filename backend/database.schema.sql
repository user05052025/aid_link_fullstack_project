-- Створення бази даних
CREATE DATABASE IF NOT EXISTS humanitarian_aid_db;
USE humanitarian_aid_db;

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                     name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(100),
    role ENUM('requester', 'volunteer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Таблиця категорій
CREATE TABLE IF NOT EXISTS categories (
                                          id INT AUTO_INCREMENT PRIMARY KEY,
                                          name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
    );

-- Таблиця запитів на допомогу
CREATE TABLE IF NOT EXISTS aid_requests (
                                            id INT AUTO_INCREMENT PRIMARY KEY,
                                            category_id INT NOT NULL,
                                            requester_id INT NOT NULL,
                                            volunteer_id INT NULL,
                                            title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2),
    priority ENUM('Низький', 'Середній', 'Високий') NOT NULL DEFAULT 'Середній',
    city VARCHAR(100),
    region VARCHAR(100) NOT NULL,
    status ENUM('Очікує на виконавця', 'В роботі', 'Виконано', 'Скасовано') NOT NULL DEFAULT 'Очікує на виконавця',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL
    );

-- Таблиця коментарів
CREATE TABLE IF NOT EXISTS comments (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        request_id INT NOT NULL,
                                        user_id INT NOT NULL,
                                        text TEXT NOT NULL,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        FOREIGN KEY (request_id) REFERENCES aid_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );