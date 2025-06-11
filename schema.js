const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pizzaria.db');

// Create tables
db.serialize(() => {
  // Categorias (ex: Pizzas, Bebidas, Sobremesas)
  db.run(`CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT
  )`);

  // Produtos (Pizzas e outros itens)
  db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER,
    imagem_url TEXT,
    disponivel BOOLEAN DEFAULT 1,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  )`);

  // Clientes
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    telefone TEXT,
    endereco TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Pedidos
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pendente',
    valor_total DECIMAL(10,2),
    forma_pagamento TEXT,
    observacoes TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  )`);

  // Itens do Pedido
  db.run(`CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER,
    produto_id INTEGER,
    quantidade INTEGER,
    preco_unitario DECIMAL(10,2),
    observacoes TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  )`);
});

// Close the database connection
db.close(); 