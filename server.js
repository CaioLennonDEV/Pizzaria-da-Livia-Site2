const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// Chave secreta para JWT
const JWT_SECRET = 'sua_chave_secreta_aqui';

// Configuração do Express
app.use(express.static('public'));
app.use(express.json());

// Conexão com o banco de dados
const db = new sqlite3.Database('pizzaria.db');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Rotas de autenticação
app.post('/api/clientes/cadastro', async (req, res) => {
    const { nome, email, telefone, endereco, senha } = req.body;

    try {
        // Verificar se o email já existe
        db.get('SELECT id FROM clientes WHERE email = ?', [email], async (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (row) {
                res.status(400).json({ error: 'Email já cadastrado' });
                return;
            }

            // Hash da senha
            const hashedSenha = await bcrypt.hash(senha, 10);

            // Inserir novo cliente
            db.run(
                'INSERT INTO clientes (nome, email, telefone, endereco, senha) VALUES (?, ?, ?, ?, ?)',
                [nome, email, telefone, endereco, hashedSenha],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    const cliente = {
                        id: this.lastID,
                        nome,
                        email
                    };

                    // Gerar token
                    const token = jwt.sign(cliente, JWT_SECRET);

                    res.json({
                        message: 'Cliente cadastrado com sucesso',
                        cliente,
                        token
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clientes/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        db.get('SELECT * FROM clientes WHERE email = ?', [email], async (err, cliente) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!cliente) {
                res.status(401).json({ error: 'Email ou senha incorretos' });
                return;
            }

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, cliente.senha);
            if (!senhaValida) {
                res.status(401).json({ error: 'Email ou senha incorretos' });
                return;
            }

            const clienteInfo = {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email
            };

            // Gerar token
            const token = jwt.sign(clienteInfo, JWT_SECRET);

            res.json({
                message: 'Login realizado com sucesso',
                cliente: clienteInfo,
                token
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota protegida de exemplo
app.get('/api/clientes/perfil', authenticateToken, (req, res) => {
    db.get('SELECT id, nome, email, telefone, endereco FROM clientes WHERE id = ?',
        [req.user.id],
        (err, cliente) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!cliente) {
                res.status(404).json({ error: 'Cliente não encontrado' });
                return;
            }
            res.json(cliente);
        }
    );
});

// Rotas da API
// Listar todas as categorias
app.get('/api/categorias', (req, res) => {
    db.all('SELECT * FROM categorias', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Listar produtos por categoria
app.get('/api/produtos/:categoriaId', (req, res) => {
    db.all('SELECT * FROM produtos WHERE categoria_id = ?', [req.params.categoriaId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Listar todos os produtos
app.get('/api/produtos', (req, res) => {
    db.all('SELECT * FROM produtos', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Criar novo pedido
app.post('/api/pedidos', (req, res) => {
    const { cliente_id, itens, valor_total } = req.body;
    
    db.run(`INSERT INTO pedidos (cliente_id, valor_total, status) VALUES (?, ?, 'pendente')`,
        [cliente_id, valor_total],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            const pedido_id = this.lastID;
            
            // Inserir itens do pedido
            const stmt = db.prepare('INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)');
            
            itens.forEach(item => {
                stmt.run(pedido_id, item.produto_id, item.quantidade, item.preco_unitario);
            });
            
            stmt.finalize();
            
            res.json({
                message: "Pedido criado com sucesso",
                pedido_id: pedido_id
            });
        }
    );
});

// Listar todos os pedidos (com filtros opcionais)
app.get('/api/pedidos', (req, res) => {
    let query = `
        SELECT 
            p.*,
            c.nome as cliente_nome,
            (
                SELECT GROUP_CONCAT(pr.nome)
                FROM itens_pedido ip2 
                JOIN produtos pr ON ip2.produto_id = pr.id 
                WHERE ip2.pedido_id = p.id
            ) as produtos
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
    `;

    const params = [];
    const conditions = [];

    if (req.query.status) {
        conditions.push('p.status = ?');
        params.push(req.query.status);
    }

    if (req.query.data) {
        conditions.push('DATE(p.data_pedido) = DATE(?)');
        params.push(req.query.data);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.data_pedido DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Ensure valor_total is a number and format produtos as array
        rows = rows.map(row => ({
            ...row,
            valor_total: Number(row.valor_total),
            produtos: row.produtos ? row.produtos.split(',') : []
        }));
        
        res.json(rows);
    });
});

// Buscar detalhes de um pedido específico
app.get('/api/pedidos/:id', (req, res) => {
    db.get(`
        SELECT 
            p.*,
            c.nome as cliente_nome,
            c.email as cliente_email,
            c.telefone as cliente_telefone,
            c.endereco as cliente_endereco
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id = ?
    `, [req.params.id], (err, pedido) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!pedido) {
            res.status(404).json({ error: 'Pedido não encontrado' });
            return;
        }

        // Buscar itens do pedido
        db.all(`
            SELECT 
                ip.*,
                p.nome,
                p.descricao
            FROM itens_pedido ip
            JOIN produtos p ON ip.produto_id = p.id
            WHERE ip.pedido_id = ?
        `, [req.params.id], (err, itens) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            pedido.itens = itens;
            res.json(pedido);
        });
    });
});

// Atualizar status do pedido
app.put('/api/pedidos/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatus = ['pendente', 'preparando', 'entregue', 'cancelado'];

    if (!validStatus.includes(status)) {
        res.status(400).json({ error: 'Status inválido' });
        return;
    }

    db.run('UPDATE pedidos SET status = ? WHERE id = ?',
        [status, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                res.status(404).json({ error: 'Pedido não encontrado' });
                return;
            }

            res.json({ message: 'Status atualizado com sucesso' });
        }
    );
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota do painel administrativo
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota da página de cadastro/login
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Inicialização do banco de dados
db.serialize(() => {
    // Criar tabelas se não existirem
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT
    )`);

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

    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE,
        telefone TEXT,
        endereco TEXT,
        senha TEXT NOT NULL,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

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

    // Inserir dados de exemplo se não existirem
    db.get("SELECT COUNT(*) as count FROM categorias", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        
        if (row.count === 0) {
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
        }
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 