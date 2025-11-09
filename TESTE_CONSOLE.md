# 🔍 Teste no Console - Método Simplificado

## ⚠️ Problema com Copiar/Colar

O erro acontece porque o código usa `await` e imports dinâmicos que o console não aceita diretamente.

## ✅ Solução: Execute Passo a Passo

### Passo 1: Verificar Variáveis (Cole 1 por vez)

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
```

**Pressione ENTER**

```javascript
console.log('Key:', import.meta.env.VITE_SUPABASE_KEY ? 'OK' : 'FALTA');
```

**Pressione ENTER**

---

### Passo 2: Testar Importação (Execute como função)

```javascript
(async () => {
  try {
    const { supabase } = await import('/src/config/supabase.ts');
    console.log('✅ Importado!');
    console.log('URL:', supabase.supabaseUrl);
    return supabase;
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
})();
```

**Pressione ENTER e aguarde resultado**

---

### Passo 3: Testar Conexão (Use o supabase do Passo 2)

Se deu certo no Passo 2, agora teste:

```javascript
const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
console.log(error ? '❌ ' + error.message : '✅ Total: ' + count);
```

**Pressione ENTER**

---

## 🎯 Me Mostre:

1. O que apareceu no Passo 1?
2. O que apareceu no Passo 2?
3. O que apareceu no Passo 3?

**Assim sei exatamente qual é o problema!**

---

## 📊 Sobre os Avisos do Supabase

**✅ NORMAL!** Esses avisos que você viu são **sugestões de segurança**, não erros:
- ⚠️ Funções sem `search_path` fixo (sugestão)
- ⚠️ Proteção de senhas vazadas (opcional)
- ⚠️ MFA não configurado (opcional)
- ℹ️ RLS sem políticas (info)

**O app funciona normalmente mesmo com esses avisos!**

---

## 🔧 Alternativa: Ver Direto no Código

Se o console não funcionar, vou verificar diretamente nos arquivos:

```bash
# Ver variáveis
cat .env

# Ver configuração Supabase
cat src/config/supabase.ts
```

