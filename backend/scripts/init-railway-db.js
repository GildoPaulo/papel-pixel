#!/usr/bin/env node

/**
 * 🚀 Script de Inicialização do Banco de Dados Railway
 * 
 * Este script cria todas as tabelas necessárias no MySQL do Railway
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🚀 RAILWAY DATABASE SETUP            ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  // Verificar variáveis de ambiente
  console.log(`${colors.blue}📋 Verificando configuração...${colors.reset}`);
  console.log(`   Host: ${process.env.DB_HOST || 'NÃO CONFIGURADO'}`);
  console.log(`   User: ${process.env.DB_USER || 'NÃO CONFIGURADO'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'NÃO CONFIGURADO'}`);
  console.log(`   Port: ${process.env.DB_PORT || '3306'}\n`);

  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error(`${colors.red}❌ ERRO: Variáveis de ambiente não configuradas!${colors.reset}`);
    console.log(`\n${colors.yellow}Configure as seguintes variáveis:${colors.reset}`);
    console.log(`   - DB_HOST`);
    console.log(`   - DB_USER`);
    console.log(`   - DB_PASSWORD`);
    console.log(`   - DB_NAME\n`);
    process.exit(1);
  }

  let connection;

  try {
    // Conectar ao banco
    console.log(`${colors.blue}🔌 Conectando ao MySQL...${colors.reset}`);
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      multipleStatements: true
    });
    console.log(`${colors.green}✅ Conectado com sucesso!${colors.reset}\n`);

    // Ler arquivo SQL
    console.log(`${colors.blue}📄 Lendo script SQL...${colors.reset}`);
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'init_database.sql');
    const sql = await fs.readFile(sqlFilePath, 'utf8');
    console.log(`${colors.green}✅ Script carregado (${sql.length} caracteres)${colors.reset}\n`);

    // Executar SQL
    console.log(`${colors.blue}⚙️  Executando script...${colors.reset}`);
    console.log(`${colors.yellow}   (Isso pode levar alguns segundos...)${colors.reset}\n`);
    
    await connection.query(sql);
    
    console.log(`${colors.green}✅ Todas as tabelas foram criadas com sucesso!${colors.reset}\n`);

    // Verificar tabelas criadas
    console.log(`${colors.blue}📊 Verificando tabelas criadas...${colors.reset}`);
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log(`\n${colors.cyan}Tabelas no banco de dados:${colors.reset}`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${colors.green}✓${colors.reset} ${index + 1}. ${tableName}`);
    });

    console.log(`\n${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║  ✅ SETUP CONCLUÍDO COM SUCESSO!      ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════╝${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}❌ ERRO ao executar script:${colors.reset}`);
    console.error(`   ${error.message}\n`);
    
    if (error.sql) {
      console.error(`${colors.yellow}SQL que causou o erro:${colors.reset}`);
      console.error(`   ${error.sql.substring(0, 200)}...\n`);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log(`${colors.blue}🔌 Conexão fechada${colors.reset}\n`);
    }
  }
}

// Executar
main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});

