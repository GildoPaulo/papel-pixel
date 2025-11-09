# 🧪 Teste de Upload de Imagens

## ✅ Correções Feitas

1. **Rota de Upload:** `POST /api/upload` adicionada no `server-simple.js`
2. **Componente ImageUpload:** Agora faz upload real (não mais base64)
3. **Servir arquivos estáticos:** `/uploads` configurado
4. **Formatar URLs:** Frontend converte `/uploads/...` para URL absoluta

## 🧪 Como Testar

### **1. Teste Upload:**

1. Abra Admin Panel
2. Clique em "Adicionar Produto"
3. Clique em "Upload" no campo de imagem
4. Selecione uma imagem do computador
5. ✅ Deve aparecer preview da imagem
6. Preencha outros campos
7. Clique em "Adicionar Produto"
8. ✅ Produto deve ser criado

### **2. Verificar Persistência:**

1. Atualize a página (F5)
2. ✅ Imagem deve continuar aparecendo
3. ✅ Não deve sumir

### **3. Verificar no Backend:**

Você deve ver no terminal do backend:
```
✅ [UPLOAD] Imagem enviada: 1234567890-987654321.jpg
✅ [UPLOAD] URL: /uploads/products/1234567890-987654321.jpg
```

### **4. Verificar Arquivo:**

Arquivo físico deve estar em:
```
backend/uploads/products/1234567890-987654321.jpg
```

---

## 🔍 Se Não Funcionar

### **Erro: "Multer não encontrado"**

```bash
cd backend
npm install multer
```

### **Erro: "Pasta não encontrada"**

A pasta é criada automaticamente, mas se der erro:
```bash
mkdir -p backend/uploads/products
```

### **Imagem ainda não aparece**

1. Veja o console do navegador (F12)
2. Verifique se há erros 404 na URL da imagem
3. Verifique se a URL está correta:
   - ✅ Deve ser: `http://localhost:3001/uploads/products/...`
   - ❌ Não deve ser: `/uploads/products/...` (sem base URL)

---

## 📝 Notas

- **Base64 antigas:** Se produtos antigos têm base64, ainda vão funcionar
- **Novos uploads:** Usarão arquivos físicos (melhor performance)
- **Limite:** 5MB por imagem
- **Tipos:** jpg, jpeg, png, gif, webp

**Teste e me informe o resultado!** 🚀

