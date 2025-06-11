# Livia Pizzaria - Sistema de Gerenciamento

Sistema de gerenciamento completo para pizzaria, desenvolvido com Node.js, Express e SQLite. O sistema oferece funcionalidades para gerenciamento de pedidos, clientes, produtos e categorias.

## 🚀 Funcionalidades

- Autenticação de clientes (cadastro e login)
- Gerenciamento de categorias de produtos
- Catálogo de produtos
- Sistema de pedidos
- Perfil de cliente
- API RESTful completa

## 📋 Pré-requisitos

- Node.js (versão recomendada: 14.x ou superior)
- NPM (Node Package Manager)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd livia-pizzaria
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npm run setup
```

4. (Opcional) Insira dados de exemplo:
```bash
npm run sample-data
```

5. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🛠️ Tecnologias Utilizadas

- **Express.js** - Framework web
- **SQLite3** - Banco de dados
- **bcrypt** - Criptografia de senhas
- **jsonwebtoken** - Autenticação JWT

## 📚 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:

- **categorias** - Categorias de produtos (ex: Pizzas, Bebidas, Sobremesas)
- **produtos** - Cadastro de produtos
- **clientes** - Dados dos clientes
- **pedidos** - Registro de pedidos
- **itens_pedido** - Itens individuais de cada pedido

## 🔐 Endpoints da API

### Autenticação
- `POST /api/clientes/cadastro` - Cadastro de novo cliente
- `POST /api/clientes/login` - Login de cliente

### Clientes
- `GET /api/clientes/perfil` - Obter perfil do cliente (requer autenticação)

### Produtos e Categorias
- `GET /api/categorias` - Listar todas as categorias
- `GET /api/produtos` - Listar todos os produtos
- `GET /api/produtos/:categoriaId` - Listar produtos por categoria

### Pedidos
- `POST /api/pedidos` - Criar novo pedido

## 📦 Scripts Disponíveis

- `npm start` - Inicia o servidor
- `npm run setup` - Configura o banco de dados
- `npm run sample-data` - Insere dados de exemplo
- `npm run query` - Executa consultas de teste

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT (JSON Web Tokens)
- Validação de dados em todas as rotas

## 📄 Licença

Este projeto está sob a licença ISC. 