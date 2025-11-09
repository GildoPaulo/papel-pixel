#!/usr/bin/env node

/**
 * SCRIPT DE TESTE DO BACKEND MYSQL
 * 
 * Use este script para testar o backend isoladamente
 * antes de conectar com o frontend.
 * 
 * Como usar:
 * 1. Certifique-se que o MySQL está rodando
 * 2. Certifique-se que o backend está rodando (npm run dev)
 * 3. Execute: node backend/scripts/test-backend.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Função para fazer requisições
async function request(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, options);
    const result = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

// Testes
async function runTests() {
  log('\n🧪 ========================================', 'cyan');
  log('   TESTE DO BACKEND MYSQL', 'cyan');
  log('   Papel & Pixel API', 'cyan');
  log('========================================\n', 'cyan');

  let testsPassed = 0;
  let testsFailed = 0;
  let adminToken = null;

  // TESTE 1: Verificar se servidor está rodando
  logInfo('TESTE 1: Verificando se servidor está rodando...');
  const healthCheck = await request('GET', '/');
  if (healthCheck.ok) {
    logSuccess('Servidor está rodando!');
    testsPassed++;
  } else {
    logError(`Servidor não está respondendo. Erro: ${healthCheck.error || 'Sem resposta'}`);
    logWarning('Certifique-se de que o backend está rodando: npm run dev');
    testsFailed++;
    return;
  }

  // TESTE 2: Login Admin
  logInfo('\nTESTE 2: Fazendo login como admin...');
  const loginResponse = await request('POST', '/auth/login', {
    email: 'admin@papelpixel.co.mz',
    password: 'admin123'
  });

  if (loginResponse.ok && loginResponse.data.token) {
    adminToken = loginResponse.data.token;
    logSuccess('Login realizado com sucesso!');
    logInfo(`Token: ${adminToken.substring(0, 20)}...`);
    testsPassed++;
  } else {
    logError(`Falha no login: ${loginResponse.data?.error || 'Erro desconhecido'}`);
    logWarning('Verifique se o usuário admin existe no banco de dados');
    testsFailed++;
    // Continuar sem token (alguns testes podem falhar)
  }

  // TESTE 3: Listar Produtos
  logInfo('\nTESTE 3: Listando produtos...');
  const productsList = await request('GET', '/products');
  if (productsList.ok) {
    const count = Array.isArray(productsList.data) ? productsList.data.length : 0;
    logSuccess(`Produtos listados! Total: ${count}`);
    if (count > 0) {
      logInfo(`Primeiro produto: ${productsList.data[0].name}`);
    }
    testsPassed++;
  } else {
    logError(`Falha ao listar produtos: ${productsList.data?.error || 'Erro desconhecido'}`);
    testsFailed++;
  }

  // TESTE 4: Criar Produto (se tiver token)
  if (adminToken) {
    logInfo('\nTESTE 4: Criando produto de teste...');
    const testProduct = {
      name: `Produto Teste ${Date.now()}`,
      category: 'Papelaria',
      price: 50.00,
      originalPrice: 60.00,
      description: 'Produto criado pelo script de teste',
      stock: 10,
      isPromotion: false,
      isFeatured: false
    };

    const createProduct = await request('POST', '/products', testProduct, adminToken);
    if (createProduct.ok && createProduct.data.id) {
      const productId = createProduct.data.id;
      logSuccess(`Produto criado com sucesso! ID: ${productId}`);
      logInfo(`Nome: ${testProduct.name}`);
      testsPassed++;

      // TESTE 5: Buscar produto específico
      logInfo('\nTESTE 5: Buscando produto criado...');
      const getProduct = await request('GET', `/products/${productId}`);
      if (getProduct.ok) {
        logSuccess(`Produto encontrado! Nome: ${getProduct.data.name}`);
        testsPassed++;
      } else {
        logError(`Falha ao buscar produto: ${getProduct.data?.error || 'Erro desconhecido'}`);
        testsFailed++;
      }

      // TESTE 6: Deletar produto de teste
      logInfo('\nTESTE 6: Deletando produto de teste...');
      const deleteProduct = await request('DELETE', `/products/${productId}`, null, adminToken);
      if (deleteProduct.ok) {
        logSuccess('Produto deletado com sucesso!');
        testsPassed++;
      } else {
        logError(`Falha ao deletar produto: ${deleteProduct.data?.error || 'Erro desconhecido'}`);
        testsFailed++;
      }
    } else {
      logError(`Falha ao criar produto: ${createProduct.data?.error || 'Erro desconhecido'}`);
      testsFailed++;
    }
  } else {
    logWarning('\nPulando testes que requerem autenticação (criar/deletar)');
  }

  // TESTE 7: Listar Pedidos
  logInfo('\nTESTE 7: Listando pedidos...');
  const ordersList = await request('GET', '/orders');
  if (ordersList.ok) {
    const count = Array.isArray(ordersList.data) ? ordersList.data.length : 0;
    logSuccess(`Pedidos listados! Total: ${count}`);
    if (count > 0) {
      logInfo(`Primeiro pedido: ID ${ordersList.data[0].id}, Total: ${ordersList.data[0].total}`);
      if (ordersList.data[0].items) {
        logInfo(`Itens no pedido: ${ordersList.data[0].items.length}`);
      }
    }
    testsPassed++;
  } else {
    logError(`Falha ao listar pedidos: ${ordersList.data?.error || 'Erro desconhecido'}`);
    logWarning('Verifique se a tabela orders existe e está populada');
    testsFailed++;
  }

  // RESUMO
  log('\n📊 ========================================', 'cyan');
  log('   RESUMO DOS TESTES', 'cyan');
  log('========================================\n', 'cyan');
  log(`✅ Testes passados: ${testsPassed}`, 'green');
  log(`❌ Testes falharam: ${testsFailed}`, 'red');
  log(`📈 Taxa de sucesso: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

  if (testsFailed === 0) {
    logSuccess('🎉 TODOS OS TESTES PASSARAM! Backend está funcionando corretamente.');
  } else {
    logWarning('⚠️  Alguns testes falharam. Revise os erros acima.');
  }

  log('\n');
}

// Executar testes
let fetch;

// Tentar usar fetch nativo (Node 18+) ou node-fetch
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    logError('Este script requer Node.js 18+ ou node-fetch instalado');
    logInfo('Execute: npm install node-fetch@2');
    logInfo('Ou use Node.js 18+');
    process.exit(1);
  }
}

// Substituir fetch global se necessário
if (typeof globalThis.fetch === 'undefined' && fetch) {
  globalThis.fetch = fetch;
}

runTests().catch(error => {
  logError(`Erro ao executar testes: ${error.message}`);
  console.error(error);
  process.exit(1);
});

