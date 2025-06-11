document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
    configurarFiltros();
    configurarModal();
});

// Carregar todos os pedidos
async function carregarPedidos(filtros = {}) {
    try {
        let url = '/api/pedidos';
        if (filtros.status) url += `?status=${filtros.status}`;
        if (filtros.data) url += `${url.includes('?') ? '&' : '?'}data=${filtros.data}`;

        const response = await fetch(url);
        const pedidos = await response.json();

        const tabelaPedidos = document.getElementById('tabelaPedidos');
        tabelaPedidos.innerHTML = '';

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${pedido.id}</td>
                <td>${pedido.cliente_nome}</td>
                <td>${formatarData(pedido.data_pedido)}</td>
                <td>${pedido.produtos}</td>
                <td>R$ ${pedido.valor_total.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${pedido.status.toLowerCase()}">
                        ${pedido.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info btn-acao" onclick="verDetalhes(${pedido.id})">
                        Detalhes
                    </button>
                    <button class="btn btn-sm btn-success btn-acao" onclick="atualizarStatus(${pedido.id})">
                        Atualizar
                    </button>
                </td>
            `;
            tabelaPedidos.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        alert('Erro ao carregar pedidos. Por favor, tente novamente.');
    }
}

// Configurar filtros
function configurarFiltros() {
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');

    btnFiltrar.addEventListener('click', () => {
        const status = document.getElementById('filtroStatus').value;
        const data = document.getElementById('filtroData').value;
        carregarPedidos({ status, data });
    });

    btnLimparFiltros.addEventListener('click', () => {
        document.getElementById('filtroStatus').value = '';
        document.getElementById('filtroData').value = '';
        carregarPedidos();
    });
}

// Ver detalhes do pedido
async function verDetalhes(pedidoId) {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        const pedido = await response.json();

        const detalhesPedido = document.getElementById('detalhesPedido');
        detalhesPedido.innerHTML = `
            <div class="detalhes-pedido">
                <h6>Informações do Cliente</h6>
                <p><strong>Nome:</strong> ${pedido.cliente_nome}</p>
                <p><strong>Email:</strong> ${pedido.cliente_email}</p>
                <p><strong>Telefone:</strong> ${pedido.cliente_telefone}</p>
                <p><strong>Endereço:</strong> ${pedido.cliente_endereco}</p>
            </div>
            <div class="detalhes-pedido">
                <h6>Itens do Pedido</h6>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantidade</th>
                            <th>Preço Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedido.itens.map(item => `
                            <tr>
                                <td>${item.nome}</td>
                                <td>${item.quantidade}</td>
                                <td>R$ ${item.preco_unitario.toFixed(2)}</td>
                                <td>R$ ${(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                            <td><strong>R$ ${pedido.valor_total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="detalhes-pedido">
                <h6>Status do Pedido</h6>
                <p><strong>Status Atual:</strong> 
                    <span class="status-badge status-${pedido.status.toLowerCase()}">
                        ${pedido.status}
                    </span>
                </p>
                <p><strong>Data do Pedido:</strong> ${formatarData(pedido.data_pedido)}</p>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('modalDetalhesPedido'));
        modal.show();
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        alert('Erro ao carregar detalhes do pedido. Por favor, tente novamente.');
    }
}

// Atualizar status do pedido
async function atualizarStatus(pedidoId) {
    try {
        const novoStatus = prompt('Digite o novo status (pendente, preparando, entregue, cancelado):');
        if (!novoStatus) return;

        const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            alert('Status atualizado com sucesso!');
            carregarPedidos();
        } else {
            throw new Error('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Por favor, tente novamente.');
    }
}

// Configurar modal
function configurarModal() {
    const btnAtualizarStatus = document.getElementById('btnAtualizarStatus');
    btnAtualizarStatus.addEventListener('click', () => {
        const pedidoId = btnAtualizarStatus.dataset.pedidoId;
        atualizarStatus(pedidoId);
    });
}

// Função auxiliar para formatar data
function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 