const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pizzaria.db');

// Exemplo de consultas
db.serialize(() => {
  // 1. Listar todas as pizzas salgadas
  console.log('\n--- Pizzas Salgadas ---');
  db.all(`
    SELECT p.nome, p.descricao, p.preco 
    FROM produtos p 
    JOIN categorias c ON p.categoria_id = c.id 
    WHERE c.nome = 'Pizzas Salgadas'
  `, (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });

  // 2. Buscar pedidos de um cliente específico
  console.log('\n--- Pedidos do Cliente João Silva ---');
  db.all(`
    SELECT p.id, p.data_pedido, p.status, p.valor_total, p.forma_pagamento
    FROM pedidos p
    JOIN clientes c ON p.cliente_id = c.id
    WHERE c.nome = 'João Silva'
  `, (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });

  // 3. Listar itens de um pedido específico
  console.log('\n--- Itens do Pedido #1 ---');
  db.all(`
    SELECT p.nome, ip.quantidade, ip.preco_unitario, (ip.quantidade * ip.preco_unitario) as subtotal
    FROM itens_pedido ip
    JOIN produtos p ON ip.produto_id = p.id
    WHERE ip.pedido_id = 1
  `, (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });

  // 4. Total de vendas por categoria
  console.log('\n--- Total de Vendas por Categoria ---');
  db.all(`
    SELECT c.nome as categoria, COUNT(ip.id) as quantidade_vendas, SUM(ip.quantidade * ip.preco_unitario) as valor_total
    FROM categorias c
    JOIN produtos p ON p.categoria_id = c.id
    JOIN itens_pedido ip ON ip.produto_id = p.id
    GROUP BY c.id
  `, (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });

  // 5. Produtos mais vendidos
  console.log('\n--- Produtos Mais Vendidos ---');
  db.all(`
    SELECT p.nome, SUM(ip.quantidade) as total_vendido
    FROM produtos p
    JOIN itens_pedido ip ON ip.produto_id = p.id
    GROUP BY p.id
    ORDER BY total_vendido DESC
    LIMIT 5
  `, (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });
});

db.close(); 