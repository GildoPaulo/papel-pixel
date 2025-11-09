# 🔧 Corrigir Problema dos Cupons

## ❌ **PROBLEMA IDENTIFICADO**

A tabela `coupons` tem **colunas incompatíveis** com o que o frontend envia!

**Frontend envia:**
- `type`, `value`, `valid_until`, `max_uses`, `applicable_categories`, `status`

**Tabela antiga tinha:**
- `discount_type`, `discount_value`, `expires_at`, `usage_limit`, `category`, `active`

---

## ✅ **SOLUÇÃO RÁPIDA (2 minutos)**

### Opção 1: Via MySQL Workbench / phpMyAdmin

1. **Abra seu cliente MySQL**

2. **Selecione o banco `papel_pixel`**

3. **Execute este SQL:**

```sql
-- Garantir que a tabela existe com colunas corretas
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL DEFAULT 'percentage',
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NULL,
  min_purchase DECIMAL(10,2) NULL,
  valid_until DATE NULL,
  max_uses INT NULL,
  times_used INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  applicable_categories TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

4. **✅ Pronto!** Tente criar o cupom novamente!

---

### Opção 2: Via Terminal/CMD (Mais Rápido)

**Execute no terminal:**

```bash
cd backend
mysql -u root -p papel_pixel < sql/fix_coupons_table.sql
```

Digite a senha do MySQL quando solicitar.

✅ **Feito!**

---

### Opção 3: Script Node.js Automático

**Execute:**

```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'papel_pixel',
    waitForConnections: true
  });

  const sql = \`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL DEFAULT 'percentage',
      value DECIMAL(10,2) NOT NULL DEFAULT 0,
      category VARCHAR(100) NULL,
      min_purchase DECIMAL(10,2) NULL,
      valid_until DATE NULL,
      max_uses INT NULL,
      times_used INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      applicable_categories TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_code (code),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  \`;

  await pool.execute(sql);
  console.log('✅ Tabela coupons criada/corrigida!');
  process.exit(0);
})();
"
```

---

## 🧪 **TESTAR**

Depois de executar qualquer uma das opções acima:

1. **Recarregue o Admin:**
   ```
   http://localhost:8080/admin
   ```

2. **Vá para aba "Cupons"**

3. **Clique em "Novo Cupom"**

4. **Preencha:**
   - Código: `BLACKFRIDAY50`
   - Tipo: Percentual
   - Valor: `50`
   - Data: `07/11/2025`
   - Pedido Mínimo: `2`
   - Categorias: `livros, papelaria`

5. **Clique em "Criar Cupom"**

✅ **Deve funcionar agora!**

---

## 🔍 **VERIFICAR SE FUNCIONOU**

Execute no MySQL:

```sql
-- Ver se tabela existe
SHOW TABLES LIKE 'coupons';

-- Ver estrutura
DESCRIBE coupons;

-- Ver cupons criados
SELECT * FROM coupons;
```

---

## 💡 **SE AINDA DER ERRO**

**Veja o console do backend** (terminal onde rodou `npm run dev`):

Deve aparecer:
```
📝 [CUPOM] Dados recebidos: { code: 'BLACKFRIDAY50', type: 'percentage', ... }
✅ [CUPOM] Cupom criado: BLACKFRIDAY50
```

Se aparecer erro, **me envie a mensagem de erro** que vou resolver!

---

**Recomendação:** Execute a **Opção 1** (mais segura) ou **Opção 2** (mais rápida)

