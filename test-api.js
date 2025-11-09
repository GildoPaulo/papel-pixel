// Script para testar rotas da API
// Execute: node test-api.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testAPI() {
  console.log('🧪 Testando API do Backend\n');
  
  // Perguntar token
  rl.question('Cole seu token de autenticação (ou Enter para pular): ', async (token) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const baseURL = 'http://localhost:3001/api';
    
    console.log('\n📋 Testando rotas...\n');
    
    // Test 1: GET /
    try {
      const res1 = await fetch(`${baseURL}/products`);
      const data1 = await res1.json();
      console.log('✅ GET /api/products:', res1.status, '-', Array.isArray(data1) ? `${data1.length} produtos` : 'OK');
    } catch (e) {
      console.log('❌ GET /api/products: ERRO -', e.message);
    }
    
    // Test 2: GET /categories
    try {
      const res2 = await fetch(`${baseURL}/products/categories`);
      const data2 = await res2.json();
      console.log('✅ GET /api/products/categories:', res2.status);
    } catch (e) {
      console.log('❌ GET /api/products/categories: ERRO -', e.message);
    }
    
    if (token) {
      // Test 3: PUT /:id
      console.log('\n📝 Testando PUT /api/products/1...');
      try {
        const res3 = await fetch(`${baseURL}/products/1`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: 'Produto Teste',
            category: 'Papelaria',
            price: 50,
            stock: 10
          })
        });
        const data3 = await res3.json();
        console.log(res3.ok ? '✅ PUT /api/products/:id: 200' : `❌ PUT /api/products/:id: ${res3.status} - ${data3.error || 'Erro'}`);
      } catch (e) {
        console.log('❌ PUT /api/products/:id: ERRO -', e.message);
      }
      
      // Test 4: DELETE /:id
      console.log('\n🗑️ Testando DELETE /api/products/999 (ID que não existe)...');
      try {
        const res4 = await fetch(`${baseURL}/products/999`, {
          method: 'DELETE',
          headers
        });
        const data4 = await res4.json();
        console.log(res4.status === 404 ? '✅ DELETE /api/products/:id: Rota funciona (404 esperado)' : `Status: ${res4.status}`);
      } catch (e) {
        console.log('❌ DELETE /api/products/:id: ERRO -', e.message);
      }
    } else {
      console.log('\n⚠️ Pulei testes PUT/DELETE (precisa token)');
    }
    
    console.log('\n✅ Testes concluídos!');
    rl.close();
  });
}

testAPI();

