const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pizzaria.db');

console.log('Reinicializando banco de dados...');

db.serialize(() => {
    // Limpar dados existentes
    db.run('DROP TABLE IF EXISTS itens_pedido');
    db.run('DROP TABLE IF EXISTS pedidos');
    db.run('DROP TABLE IF EXISTS produtos');
    db.run('DROP TABLE IF EXISTS categorias');

    // Recriar tabelas
    db.run(`CREATE TABLE categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT
    )`);

    db.run(`CREATE TABLE produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        categoria_id INTEGER,
        imagem_url TEXT,
        disponivel BOOLEAN DEFAULT 1,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )`);

    // Inserir dados de exemplo
    db.run(`INSERT INTO categorias (nome, descricao) VALUES 
        ('Pizzas Salgadas', 'Nossas deliciosas pizzas salgadas'),
        ('Pizzas Doces', 'Pizzas doces para sobremesa'),
        ('Bebidas', 'Refrigerantes e sucos'),
        ('Sobremesas', 'Sobremesas especiais')`);

    db.run(`INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_url) VALUES 
        ('Pizza Margherita', 'Molho de tomate, mussarela, manjericão fresco', 45.90, 1, '/images/margherita.jpg'),
        ('Pizza Pepperoni', 'Molho de tomate, mussarela, pepperoni', 49.90, 1, '/images/pepperoni.jpg'),
        ('Pizza Portuguesa', 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas', 47.90, 1, '/images/portuguesa.jpg'),
        ('Pizza Chocolate', 'Chocolate ao leite, morangos', 42.90, 2, '/images/chocolate.jpg'),
        ('Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 12.90, 3, '/images/coca.jpg'),
        ('Guaraná 2L', 'Refrigerante Guaraná Antarctica 2 litros', 10.90, 3, '/images/guarana.jpg'),
        ('Brownie', 'Brownie de chocolate com sorvete', 15.90, 4, '/images/brownie.jpg')`);

    // Verificar dados inseridos
    console.log('\nVerificando dados inseridos:');
    
    db.all('SELECT * FROM categorias', (err, categorias) => {
        if (err) {
            console.error('Erro ao buscar categorias:', err);
            return;
        }
        console.log('\nCategorias:', categorias);

        db.all('SELECT * FROM produtos', (err, produtos) => {
            if (err) {
                console.error('Erro ao buscar produtos:', err);
                return;
            }
            console.log('\nProdutos:', produtos);
            
            console.log('\nDados reinicializados com sucesso!');
            db.close();
        });
    });
}); 