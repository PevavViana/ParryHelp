CREATE DATABASE IF NOT EXISTS parryhelp_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE parryhelp_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(120) NOT NULL,
    categoria_id INT NOT NULL,
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(120) NOT NULL,
    nota FLOAT NOT NULL,
    data DATE NOT NULL,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

/*========== PROCEDURES ==========*/

DROP PROCEDURE IF EXISTS sp_produtos_mais_avaliados;

DELIMITER //
CREATE PROCEDURE sp_produtos_mais_avaliados( IN p_limite INT )
BEGIN
    SELECT
        p.id,
        p.nome,
        p.descricao,
        p.categoria_id,
        AVG(a.nota) AS media_notas,
        COUNT(a.id) AS total_avaliacoes
    FROM produtos p
    JOIN avaliacoes a ON a.produto_id = p.id
    GROUP BY p.id, p.nome, p.descricao, p.categoria_id
    ORDER BY media_notas DESC
    LIMIT p_limite;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_produtos_por_categoria;

DELIMITER //
CREATE PROCEDURE sp_produtos_por_categoria( IN p_categoria_id INT )
BEGIN
    SELECT
        p.id,
        p.nome,
        p.descricao,
        c.nome AS categoria_nome
    FROM produtos p
    JOIN categorias c ON c.id = p.categoria_id
    WHERE p.categoria_id = p_categoria_id
    ORDER BY p.nome ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_historico_avaliacoes_usuario;

DELIMITER //
CREATE PROCEDURE sp_historico_avaliacoes_usuario( IN p_usuario_id INT )
BEGIN
    SELECT
        a.id,
        a.titulo,
        a.descricao,
        a.nota,
        a.data,
        p.nome AS produto_nome
    FROM avaliacoes a
    JOIN produtos p ON p.id = a.produto_id
    WHERE a.usuario_id = p_usuario_id
    ORDER BY a.data DESC;
END //
DELIMITER ;