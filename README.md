# Pizzaria da Livia - Sistema de Gerenciamento

Este é um sistema de gerenciamento para a Pizzaria da Livia, desenvolvido com Node.js e SQLite.

## Estrutura do Banco de Dados

O sistema utiliza um banco de dados SQLite com as seguintes tabelas:

- **categorias**: Armazena as categorias de produtos (ex: Pizzas Salgadas, Pizzas Doces, etc.)
- **produtos**: Cadastro de todos os produtos disponíveis
- **clientes**: Informações dos clientes
- **pedidos**: Registro dos pedidos realizados
- **itens_pedido**: Itens incluídos em cada pedido

## Requisitos

- Node.js (versão 12 ou superior)
- NPM (Node Package Manager)

## Instalação

1. Clone este repositório
2. Instale as dependências:
```bash
npm install
```

## Configuração do Banco de Dados

1. Para criar as tabelas do banco de dados:
```bash
npm run setup
```

2. Para inserir dados de exemplo:
```bash
npm run sample-data
```

3. Para executar as consultas de exemplo:
```bash
npm run query
```

## Exemplos de Consultas Implementadas

O arquivo `queries.js` contém exemplos de consultas comuns:

1. Listar todas as pizzas salgadas
2. Buscar pedidos de um cliente específico
3. Listar itens de um pedido específico
4. Total de vendas por categoria
5. Produtos mais vendidos

## Estrutura de Arquivos

- `schema.js`: Criação das tabelas do banco de dados
- `insert_sample_data.js`: Inserção de dados de exemplo
- `queries.js`: Exemplos de consultas
- `pizzaria.db`: Arquivo do banco de dados SQLite (criado automaticamente)

## Observações

- O banco de dados é criado automaticamente ao executar o script de configuração
- Os dados de exemplo incluem produtos, clientes e pedidos fictícios
- Todas as consultas são feitas de forma assíncrona
- Os preços estão em Reais (R$)

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Faça push para a branch
5. Abra um Pull Request 