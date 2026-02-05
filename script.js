// ============================================
// SCRIPT DE AUTENTICAÇÃO - auth.js
// ============================================

// Elementos do DOM
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// ============================================
// ABRIR E FECHAR MODAL
// ============================================

// Abrir modal
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

// Fechar modal
closeModal.addEventListener('click', () => {
    authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    hideMessages();
});

// Fechar ao clicar fora do modal
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        hideMessages();
    }
});

// ============================================
// ALTERNAR TABS (LOGIN / CADASTRO)
// ============================================

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Ativa tab clicada
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Mostra formulário correspondente
        authForms.forEach(form => form.classList.remove('active'));
        document.getElementById(tab + 'Form').classList.add('active');
        
        hideMessages();
    });
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
}

function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
}

function hideMessages() {
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
}

function updateUIForLoggedUser(usuario) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = usuario.nome;
}

function updateUIForLoggedOut() {
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
    userName.textContent = '';
}

// ============================================
// VERIFICAR SE USUÁRIO JÁ ESTÁ LOGADO
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    if (token && usuario) {
        try {
            const user = JSON.parse(usuario);
            updateUIForLoggedUser(user);
            console.log('👤 Usuário logado:', user.nome);
        } catch (e) {
            console.error('Erro ao parsear usuário:', e);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    }
});

// ============================================
// LOGOUT
// ============================================

logoutBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        updateUIForLoggedOut();
        console.log('👋 Logout realizado');
        
        // Mostra mensagem de sucesso
        alert('Logout realizado com sucesso!');
    }
});

// ============================================
// FORMULÁRIO DE LOGIN
// ============================================

const loginForm = document.getElementById('loginForm');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginLoading = document.getElementById('loginLoading');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    // Validações
    if (!email || !senha) {
        showError('⚠️ Preencha todos os campos!');
        return;
    }

    loginSubmitBtn.disabled = true;
    loginLoading.style.display = 'block';

    try {
        console.log('🔐 Tentando login...', { email });
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        console.log('📡 Status:', response.status);
        const data = await response.json();
        console.log('📦 Resposta:', data);

        if (response.ok) {
            // Salva token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            showSuccess('✅ Login realizado! Bem-vindo, ' + data.usuario.nome);
            
            setTimeout(() => {
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                updateUIForLoggedUser(data.usuario);
                loginForm.reset();
            }, 1500);
        } else {
            showError('❌ ' + (data.erro || 'Erro ao fazer login'));
        }
    } catch (error) {
        console.error('❌ Erro completo:', error);
        showError('❌ Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
        loginSubmitBtn.disabled = false;
        loginLoading.style.display = 'none';
    }
});

// ============================================
// FORMULÁRIO DE CADASTRO
// ============================================

const cadastroForm = document.getElementById('cadastroForm');
const cadastroSubmitBtn = document.getElementById('cadastroSubmitBtn');
const cadastroLoading = document.getElementById('cadastroLoading');

cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const nome = document.getElementById('cadastroNome').value.trim();
    const idade = document.getElementById('cadastroIdade').value;
    const arte_marcial = document.getElementById('cadastroFaixa').value;
    const email = document.getElementById('cadastroEmail').value.trim();
    const senha = document.getElementById('cadastroSenha').value;
    const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;

    // Validações
    if (!nome || !idade || !arte_marcial || !email || !senha || !confirmarSenha) {
        showError('⚠️ Preencha todos os campos!');
        return;
    }

    if (senha !== confirmarSenha) {
        showError('❌ As senhas não coincidem!');
        return;
    }

    if (senha.length < 6) {
        showError('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    cadastroSubmitBtn.disabled = true;
    cadastroLoading.style.display = 'block';

    try {
        console.log('📝 Criando conta...', { nome, idade, arte_marcial: arte_marcial, email });
        
        const response = await fetch('/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, idade, arte_marcial, email, senha })
        });

        console.log('📡 Status:', response.status);
        const data = await response.json();
        console.log('📦 Resposta:', data);

        if (response.ok) {
            // Salva token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            showSuccess('✅ Conta criada! Bem-vindo, ' + data.usuario.nome);
            
            setTimeout(() => {
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                updateUIForLoggedUser(data.usuario);
                cadastroForm.reset();
            }, 1500);
        } else {
            showError('❌ ' + (data.erro || 'Erro ao criar conta'));
        }
    } catch (error) {
        console.error('❌ Erro completo:', error);
        showError('❌ Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
        cadastroSubmitBtn.disabled = false;
        cadastroLoading.style.display = 'none';
    }
});

// ============================================
// FUNÇÃO PARA ACESSAR ROTA PROTEGIDA
// ============================================

async function buscarPerfil() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ Usuário não autenticado');
        return null;
    }

    try {
        const response = await fetch('/api/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('👤 Perfil completo:', data);
            return data;
        } else {
            console.log('❌ Token inválido ou expirado');
            // Token inválido, faz logout
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            updateUIForLoggedOut();
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return null;
    }
}

// Exemplo de uso:
// buscarPerfil().then(perfil => console.log(perfil));

console.log('✅ Script de autenticação carregado!');