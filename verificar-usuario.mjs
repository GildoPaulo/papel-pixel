// Script para verificar e criar usuário no Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Ler .env manualmente
let supabaseUrl = 'https://leqyvitngubadvsyfzya.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcXl2aXRuZ3ViYWR2c3lmenlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1Nzc2MTksImV4cCI6MjA3NzE1MzYxOX0.eLs15AWrJCjQK-iTnifRG6EoVQ-1KRTEdCx2M0Bpu7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO DO LOGIN\n');

const email = 'gildopaulovictor@gmail.com';
const password = 'Giseveral@01';

async function diagnostico() {
  try {
    // 1. Verificar conexão
    console.log('1️⃣ Testando conexão com Supabase...');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return;
    }
    console.log('✅ Conexão OK\n');
    
    // 2. Verificar na tabela users
    console.log('2️⃣ Verificando na tabela users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (usersError) {
      console.error('❌ Erro:', usersError.message);
    } else if (users && users.length > 0) {
      console.log('✅ Usuário encontrado:');
      console.log('   ID:', users[0].id);
      console.log('   Nome:', users[0].name);
      console.log('   Email:', users[0].email);
      console.log('   Role:', users[0].role);
    } else {
      console.log('❌ Usuário NÃO encontrado na tabela users');
    }
    console.log('');
    
    // 3. Tentar fazer login
    console.log('3️⃣ Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (loginError) {
      console.error('❌ Erro de login:', loginError.message);
      console.error('   Código:', loginError.status || 'N/A');
      console.log('\n📋 SOLUÇÕES POSSÍVEIS:');
      console.log('\nA) Criar usuário no Dashboard:');
      console.log('   1. Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya');
      console.log('   2. Vá em Authentication > Users');
      console.log('   3. Clique em "Add user"');
      console.log(`   4. Email: ${email}`);
      console.log(`   5. Password: ${password}`);
      console.log('   6. Marque "Auto Confirm User"');
      console.log('   7. Clique "Create user"');
      console.log('\nB) Depois execute este SQL no SQL Editor:');
      console.log(`\nINSERT INTO public.users (id, name, email, role)\nSELECT \n  id,\n  'Gildo Paulo Victor' as name,\n  email,\n  'admin' as role\nFROM auth.users\nWHERE email = '${email}'\nON CONFLICT (id) DO UPDATE SET \n  name = 'Gildo Paulo Victor',\n  email = EXCLUDED.email,\n  role = 'admin';\n`);
    } else {
      console.log('✅ LOGIN REALIZADO COM SUCESSO!');
      console.log('   User ID:', loginData.user?.id);
      console.log('   Session:', loginData.session ? '✅ Ativa' : '❌ Não ativa');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

diagnostico();

