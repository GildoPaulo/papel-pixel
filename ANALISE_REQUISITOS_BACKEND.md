# 📋 Análise de Requisitos vs Backend Atual

## 🔍 Situação Atual vs Requisitos

### ✅ **O que JÁ está implementado:**

1. **RF-01: Login e Registro** ✅
   - Sistema de autenticação JWT funcional
   - Registro de novos usuários
   - Endpoints: `/api/auth/login`, `/api/auth/register`

2. **RF-04: Telas de cadastro** ✅
   - CRUD completo de produtos
   - CRUD de pedidos
   - Admin Panel implementado

3. **RNF-04: Servidor** ✅
   - Node.js + Express configurado
   - Middleware de segurança implementado

4. **RNF-05: Endpoints** ✅
   - API REST completa
   - Endpoints documentados

5. **RNF-07: Linguagem** ✅
   - JavaScript/Node.js

---

## ⚠️ **O que PRECISA ser ajustado:**

### 1. **RF-02: Controle de Acesso - Papéis de Usuário**

**Requisito:** Admin, Analyst, Assistant  
**Atual:** Apenas 'user' e 'admin'

**Ação necessária:**
- ✅ Adicionar papéis 'analyst' e 'assistant' no schema
- ✅ Criar middlewares de permissão
- ✅ Analyst: pode cadastrar e modificar
- ✅ Assistant: apenas visualizar

---

### 2. **RNF-01: Integração OAuth**

**Requisito:** Login com Google/LinkedIn  
**Atual:** Apenas email/password

**Ação necessária:**
- ✅ Integrar Passport.js ou Supabase OAuth
- ✅ Endpoints: `/api/auth/google`, `/api/auth/linkedin`

---

### 3. **RNF-03: Banco de Dados**

**Requisito:** MongoDB (não relacional)  
**Atual:** MySQL (relacional)

**Decisão necessária:**
- ⚠️ **IMPORTANTE:** Migrar para MongoDB? 
- ⚠️ **ALTERNATIVA:** Manter MySQL (mais adequado para e-commerce)
- 💡 **Recomendação:** Manter MySQL, pois:
  - E-commerce precisa de relacionamentos (pedidos, itens)
  - Transações ACID são importantes
  - Já está funcionando perfeitamente

---

### 4. **RF-06: Importação CSV**

**Requisito:** Download e importação de produtos via CSV  
**Atual:** Não implementado

**Ação necessária:**
- ✅ Criar endpoint `/api/products/import` (POST)
- ✅ Criar endpoint `/api/products/export` (GET)
- ✅ Processar arquivo CSV com `csv-parser`

---

### 5. **RF-07: Relatório Gráfico**

**Requisito:** Gráficos de estatísticas  
**Atual:** Parcialmente implementado (stats endpoint existe)

**Ação necessária:**
- ✅ Melhorar endpoint `/api/stats`
- ✅ Adicionar dados de usuários por papel
- ✅ Quantidade de produtos por categoria

---

### 6. **RNF-09: Armazenamento em Nuvem (AWS S3)**

**Requisito:** Upload de arquivos na AWS S3  
**Atual:** Upload local (`/uploads`)

**Ação necessária:**
- ✅ Integrar AWS SDK
- ✅ Configurar S3 bucket
- ✅ Migrar função de upload

---

### 7. **RF-03: Menu Lateral**

**Requisito:** Menu lateral na aplicação  
**Atual:** Header horizontal

**Ação necessária:**
- ✅ Criar componente Sidebar/Menu lateral no frontend
- ✅ Implementar navegação por tabs/seções

---

### 8. **RF-05: Tela Mestre/Detalhe**

**Requisito:** Tela mestre/detalhe para entidades  
**Atual:** CRUD básico

**Ação necessária:**
- ✅ Adicionar rotas de detalhe
- ✅ Interface mestre/detalhe no frontend

---

## 🚀 Plano de Implementação

### **FASE 1: Ajustes Críticos (Compatibilidade)**

1. **Adicionar Papéis de Usuário**
   ```sql
   ALTER TABLE users 
   MODIFY role ENUM('user', 'admin', 'analyst', 'assistant') DEFAULT 'user';
   ```

2. **Criar Middlewares de Permissão**
   - `isAnalyst`: Pode criar e modificar
   - `isAssistant`: Apenas leitura
   - `isAdmin`: Todas as permissões

### **FASE 2: Funcionalidades Novas**

3. **Implementar OAuth**
   - Google OAuth
   - LinkedIn OAuth

4. **Importação CSV**
   - Endpoint de import
   - Endpoint de export
   - Validação de dados

5. **Melhorar Relatórios**
   - Endpoint de estatísticas completo
   - Dados por papel

### **FASE 3: Melhorias de Interface**

6. **Menu Lateral**
   - Componente Sidebar
   - Navegação reorganizada

7. **Telas Mestre/Detalhe**
   - Layout de detalhes
   - Lista + Detalhe lado a lado

### **FASE 4: Infraestrutura (Opcional)**

8. **AWS S3 Integration**
   - Configurar bucket
   - Migrar uploads
   - Configurar variáveis de ambiente

---

## 💡 Recomendações Importantes

### **1. MongoDB vs MySQL**

**NÃO recomendamos migrar para MongoDB porque:**
- ✅ MySQL é melhor para e-commerce (relacionamentos)
- ✅ Transações ACID necessárias para pagamentos
- ✅ Sistema já funciona perfeitamente
- ✅ Custos de migração altos

**Solução:** Documentar exceção técnica ou adaptar requisitos.

### **2. Priorização**

**Alta Prioridade (Essencial):**
- ✅ Papéis de usuário (RF-02)
- ✅ Importação CSV (RF-06)
- ✅ Menu lateral (RF-03)

**Média Prioridade:**
- ✅ OAuth (RNF-01)
- ✅ Relatórios melhorados (RF-07)

**Baixa Prioridade (Pode ser opcional):**
- ⚠️ AWS S3 (pode manter local por enquanto)
- ⚠️ MongoDB (manter MySQL)

---

## 📝 Próximos Passos

1. **Decidir sobre MongoDB:** Manter MySQL ou migrar?
2. **Implementar papéis:** Analyst e Assistant
3. **Criar OAuth:** Google e LinkedIn
4. **CSV Import/Export:** Funcionalidade completa
5. **Melhorar relatórios:** Endpoint completo de stats

---

**Deseja que eu comece implementando algum desses itens? Recomendo começar pelos papéis de usuário e importação CSV.**

