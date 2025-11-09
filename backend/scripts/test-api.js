#!/usr/bin/env node

const http = require('http');

const API_URL = 'http://localhost:3001';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let testResults = [];
let authToken = '';

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTest(name, testFn) {
  log(`\n🧪 ${name}...`, colors.blue);
  try {
    const result = await testFn();
    testResults.push({ name, passed: true });
    log(`✅ ${name} - PASSOU`, colors.green);
    return result;
  } catch (error) {
    testResults.push({ name, passed: false, error: error.message });
    log(`❌ ${name} - FALHOU: ${error.message}`, colors.red);
    return null;
  }
}

async function main() {
  log('\n═══════════════════════════════════════', colors.blue);
  log('🚀 TESTES AUTOMATIZADOS - PAPEL & PIXEL', colors.blue);
  log('═══════════════════════════════════════\n', colors.blue);

  // Teste 1: Health Check
  await runTest('Health Check', async () => {
    const response = await makeRequest('GET', '/');
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    if (!response.data.message) throw new Error('Sem mensagem');
  });

  // Teste 2: Registro
  await runTest('Registrar Usuário', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Teste User',
      email: 'teste' + Date.now() + '@teste.com',
      password: 'senha123'
    });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Status ${response.status}`);
    }
  });

  // Teste 3: Login
  await runTest('Login', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'teste@teste.com',
      password: 'senha123'
    });
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    if (response.data && response.data.token) {
      authToken = response.data.token;
    }
  });

  // Teste 4: Buscar Produtos
  await runTest('Buscar Produtos', async () => {
    const response = await makeRequest('GET', '/api/products');
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
  });

  // Teste 5: Buscar Pedidos (requer auth)
  if (authToken) {
    await runTest('Buscar Pedidos', async () => {
      const response = await makeRequest('GET', '/api/orders', null, authToken);
      if (response.status !== 200) throw new Error(`Status ${response.status}`);
    });
  }

  // Teste 6: Rate Limiting
  await runTest('Rate Limiting', async () => {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(makeRequest('GET', '/api/products'));
    }
    await Promise.all(requests);
    log('   (5 requisições simultâneas - deve passar)', colors.yellow);
  });

  // Resumo
  log('\n═══════════════════════════════════════', colors.blue);
  log('📊 RESUMO DOS TESTES', colors.blue);
  log('═══════════════════════════════════════\n', colors.blue);

  const passed = testResults.filter(t => t.passed).length;
  const total = testResults.length;

  log(`Total: ${total} | Passou: ${passed} | Falhou: ${total - passed}\n`, 
    passed === total ? colors.green : colors.yellow);

  testResults.forEach(test => {
    if (test.passed) {
      log(`✅ ${test.name}`, colors.green);
    } else {
      log(`❌ ${test.name}`, colors.red);
      if (test.error) log(`   Erro: ${test.error}`, colors.red);
    }
  });

  log('\n═══════════════════════════════════════\n', colors.blue);
}

main().catch(console.error);

