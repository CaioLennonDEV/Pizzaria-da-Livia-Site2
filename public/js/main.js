document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const menuContainer = document.getElementById('menu-container');
    const userArea = document.getElementById('userArea');
    const pedidoModal = new bootstrap.Modal(document.getElementById('pedidoModal'));
    const pedidoForm = document.getElementById('pedido-form');
    const confirmarPedidoBtn = document.getElementById('confirmar-pedido');

    // Variáveis globais
    let produtoSelecionado = null;
    let categorias = [];
    let produtos = [];

    // Verificar autenticação
    function verificarAutenticacao() {
        const token = localStorage.getItem('token');
        const clienteNome = localStorage.getItem('clienteNome');

        if (token && clienteNome) {
            userArea.innerHTML = `
                <span class="nav-item">
                    <span class="nav-link">Olá, ${clienteNome}</span>
                </span>
                <button class="btn btn-outline-light ms-2" onclick="logout()">Sair</button>
            `;
        } else {
            userArea.innerHTML = `
                <a href="/cadastro" class="nav-link">Entrar / Cadastrar</a>
            `;
        }
    }

    // Função de logout
    window.logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('clienteId');
        localStorage.removeItem('clienteNome');
        verificarAutenticacao();
        window.location.reload();
    };

    // Carregar categorias
    async function carregarCategorias() {
        try {
            const response = await fetch('/api/categorias');
            categorias = await response.json();
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    // Carregar produtos
    async function carregarProdutos() {
        try {
            const response = await fetch('/api/produtos');
            produtos = await response.json();
            exibirProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // Exibir produtos no menu
    function exibirProdutos() {
        menuContainer.innerHTML = '';
        
        // Agrupar produtos por categoria
        const produtosPorCategoria = {};
        produtos.forEach(produto => {
            if (!produtosPorCategoria[produto.categoria_id]) {
                produtosPorCategoria[produto.categoria_id] = [];
            }
            produtosPorCategoria[produto.categoria_id].push(produto);
        });

        // Criar seções para cada categoria
        categorias.forEach(categoria => {
            const produtosDaCategoria = produtosPorCategoria[categoria.id] || [];
            if (produtosDaCategoria.length > 0) {
                const categoriaHtml = `
                    <div class="col-12 mb-4">
                        <h3 class="mb-3">${categoria.nome}</h3>
                        <div class="row">
                            ${produtosDaCategoria.map(produto => `
                                <div class="col-md-4 mb-4">
                                    <div class="card h-100">
                                        ${produto.imagem_url ? `
                                            <img src="${produto.imagem_url}" class="card-img-top" alt="${produto.nome}">
                                        ` : ''}
                                        <div class="card-body">
                                            <h5 class="card-title">${produto.nome}</h5>
                                            <p class="card-text">${produto.descricao}</p>
                                            <p class="card-text"><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
                                            <button class="btn btn-primary" onclick="fazerPedido(${produto.id})">
                                                Pedir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                menuContainer.innerHTML += categoriaHtml;
            }
        });
    }

    // Função para fazer pedido
    window.fazerPedido = (produtoId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Por favor, faça login para fazer um pedido.');
            window.location.href = '/cadastro';
            return;
        }

        produtoSelecionado = produtos.find(p => p.id === produtoId);
        if (produtoSelecionado) {
            pedidoModal.show();
        }
    };

    // Confirmar pedido
    confirmarPedidoBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        const clienteId = localStorage.getItem('clienteId');
        const quantidade = document.getElementById('quantidade').value;
        const observacoes = document.getElementById('observacoes').value;

        if (!token || !clienteId || !produtoSelecionado) {
            alert('Erro ao processar pedido. Por favor, tente novamente.');
            return;
        }

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    cliente_id: clienteId,
                    itens: [{
                        produto_id: produtoSelecionado.id,
                        quantidade: parseInt(quantidade),
                        preco_unitario: produtoSelecionado.preco,
                        observacoes
                    }],
                    valor_total: produtoSelecionado.preco * parseInt(quantidade)
                })
            });

            if (response.ok) {
                alert('Pedido realizado com sucesso!');
                pedidoModal.hide();
                document.getElementById('quantidade').value = '1';
                document.getElementById('observacoes').value = '';
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao realizar pedido');
            }
        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            alert('Erro ao processar pedido. Por favor, tente novamente.');
        }
    });

    // Inicialização
    verificarAutenticacao();
    carregarCategorias().then(() => carregarProdutos());

    // Máscara para telefone no formulário de contato
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = '(' + value;
                if (value.length > 3) {
                    value = value.slice(0, 3) + ') ' + value.slice(3);
                    if (value.length > 10) {
                        value = value.slice(0, 10) + '-' + value.slice(10, 14);
                    }
                }
            }
            e.target.value = value;
        });
    }

    // Formulário de contato
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                mensagem: document.getElementById('mensagem').value
            };

            try {
                const response = await fetch('/api/contato', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Mensagem enviada com sucesso!');
                    contactForm.reset();
                } else {
                    throw new Error('Erro ao enviar mensagem');
                }
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                alert('Erro ao enviar mensagem. Por favor, tente novamente.');
            }
        });
    }
}); 