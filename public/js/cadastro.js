document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
    const loginForm = document.getElementById('login-form');

    // Configurar formulário de cadastro
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const endereco = document.getElementById('endereco').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        // Validar senha
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch('/api/clientes/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    email,
                    telefone,
                    endereco,
                    senha
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                // Salvar token no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('clienteId', data.cliente.id);
                localStorage.setItem('clienteNome', data.cliente.nome);
                window.location.href = '/'; // Redirecionar para a página principal
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert(error.message || 'Erro ao realizar cadastro. Por favor, tente novamente.');
        }
    });

    // Configurar formulário de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        try {
            const response = await fetch('/api/clientes/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Salvar token no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('clienteId', data.cliente.id);
                localStorage.setItem('clienteNome', data.cliente.nome);
                window.location.href = '/'; // Redirecionar para a página principal
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert(error.message || 'Email ou senha incorretos.');
        }
    });

    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
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
}); 