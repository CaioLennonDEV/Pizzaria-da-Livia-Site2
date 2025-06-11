const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pizzaria.db');

// Adicionar coluna senha à tabela clientes
db.serialize(() => {
    // Criar tabela temporária com a nova estrutura
    db.run(`CREATE TABLE clientes_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE,
        telefone TEXT,
        endereco TEXT,
        senha TEXT NOT NULL DEFAULT '',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Copiar dados da tabela antiga para a nova
    db.run(`INSERT INTO clientes_temp (id, nome, email, telefone, endereco, data_cadastro)
            SELECT id, nome, email, telefone, endereco, data_cadastro FROM clientes`);

    // Deletar tabela antiga
    db.run(`DROP TABLE clientes`);

    // Renomear tabela temporária
    db.run(`ALTER TABLE clientes_temp RENAME TO clientes`);

    console.log('Migração concluída com sucesso!');
    db.close();
}); 