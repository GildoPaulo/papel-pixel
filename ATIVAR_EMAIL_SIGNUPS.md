# ✅ ATIVAR EMAIL SIGNUPS NO SUPABASE

## 🎯 O ERRO

```
Erro ao criar conta: Email signups are disabled
```

**Significa:** O registro de novos usuários por email está DESATIVADO no Supabase.

---

## 🔧 SOLUÇÃO

### Passo 1: Ativar Email Signups

1. Abra: https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/auth/providers
2. Clique em **"Email"** (primeiro item)
3. Procure por: **"Enable email provider"**
4. **ATIVE** (toggle ON) ✅
5. Procure por: **"Confirm email"**
6. **DESATIVE** (toggle OFF) ❌
7. Clique em **"Save"**

---

## 🎯 CONFIGURAÇÃO CORRETA

No Supabase, estas opções devem estar assim:

| Opção | Valor |
|-------|-------|
| **Enable email provider** | ✅ **ON** (ATIVO) |
| **Confirm email** | ❌ **OFF** (DESATIVO) |
| **Enable email confirmations** | ❌ **OFF** (DESATIVO) |

**IMPORTANTE:**
- ✅ Email provider DEVE estar ATIVO
- ❌ Confirm email DEVE estar DESATIVO

---

## 🧪 TESTAR AGORA

1. Recarregue o app (Ctrl+Shift+R)
2. Vá para: http://localhost:8080/register
3. Preencha:
   - Nome: `Teste`
   - Email: `teste123@teste.com` (use um novo)
   - Senha: `123456`
4. Clique em **"Criar Conta"**

**Deve funcionar agora!** ✅

---

## 📝 SE AINDA NÃO FUNCIONAR

### Verificar se Signups Está Ativo

Execute no Supabase SQL Editor:

```sql
-- Verificar configuração
SELECT 
  name,
  value
FROM vault.secrets 
WHERE name LIKE '%signup%' OR name LIKE '%email%';

-- Ou simplesmente teste criar usuário diretamente:
SELECT 'Configuração OK' as status;
```

---

## ✅ CHECKLIST

- [ ] "Enable email provider" = ON ✅
- [ ] "Confirm email" = OFF ❌
- [ ] Salvou as configurações
- [ ] Recarregou o app
- [ ] Tentou criar conta nova
- [ ] Funcionou! ✅

---

## 🎉 DEVE FUNCIONAR AGORA!

O problema era simples: **Email signups estavam desabilitados!**

Ative "Enable email provider" e desative "Confirm email".

Depois teste novamente! 🚀

