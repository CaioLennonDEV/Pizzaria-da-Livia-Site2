const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pizzaria.db');

console.log('Verificando dados do banco...');

// Verificar categorias
db.all('SELECT * FROM categorias', (err, categorias) => {
    if (err) {
        console.error('Erro ao buscar categorias:', err);
        return;
    }
    console.log('\nCategorias:', categorias);

    // Verificar produtos
    db.all('SELECT * FROM produtos', (err, produtos) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return;
        }
        console.log('\nProdutos:', produtos);
        
        db.close();
    });
}); 