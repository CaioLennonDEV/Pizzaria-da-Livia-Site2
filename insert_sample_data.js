const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pizzaria.db');

db.serialize(() => {
  // Inserir categorias
  const categorias = [
    ['Pizzas Salgadas', 'Pizzas tradicionais e especiais'],
    ['Pizzas Doces', 'Deliciosas sobremesas em forma de pizza'],
    ['Bebidas', 'Refrigerantes, sucos e bebidas alcoólicas'],
    ['Sobremesas', 'Doces e sobremesas variadas']
  ];

  const insertCategoria = db.prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)');
  categorias.forEach(categoria => {
    insertCategoria.run(categoria);
  });
  insertCategoria.finalize();

  // Inserir produtos
  const produtos = [
    ['Pizza Margherita', 'Molho de tomate, mussarela, manjericão fresco', 45.90, 1],
    ['Pizza Portuguesa', 'Mussarela, presunto, ovos, cebola, azeitonas', 49.90, 1],
    ['Pizza Calabresa', 'Calabresa fatiada, cebola, mussarela', 45.90, 1],
    ['Pizza Chocolate', 'Chocolate ao leite e granulado', 42.90, 2],
    ['Pizza Banana', 'Banana, canela, leite condensado', 42.90, 2],
    ['Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 12.90, 3],
    ['Suco Natural', 'Suco de laranja natural 500ml', 8.90, 3],
    ['Pudim', 'Pudim de leite condensado', 12.90, 4]
  ];

  const insertProduto = db.prepare('INSERT INTO produtos (nome, descricao, preco, categoria_id) VALUES (?, ?, ?, ?)');
  produtos.forEach(produto => {
    insertProduto.run(produto);
  });
  insertProduto.finalize();

  // Inserir clientes
  const clientes = [
    ['João Silva', 'joao@email.com', '11999999999', 'Rua A, 123'],
    ['Maria Santos', 'maria@email.com', '11988888888', 'Rua B, 456'],
    ['Pedro Oliveira', 'pedro@email.com', '11977777777', 'Rua C, 789']
  ];

  const insertCliente = db.prepare('INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)');
  clientes.forEach(cliente => {
    insertCliente.run(cliente);
  });
  insertCliente.finalize();

  // Inserir pedidos
  db.run(`INSERT INTO pedidos (cliente_id, status, valor_total, forma_pagamento) VALUES (1, 'entregue', 58.80, 'cartão')`);
  db.run(`INSERT INTO pedidos (cliente_id, status, valor_total, forma_pagamento) VALUES (2, 'preparando', 95.80, 'dinheiro')`);

  // Inserir itens dos pedidos
  db.run(`INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (1, 1, 1, 45.90)`);
  db.run(`INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (1, 6, 1, 12.90)`);
  db.run(`INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (2, 2, 1, 49.90)`);
  db.run(`INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (2, 4, 1, 42.90)`);
});

db.close(); 