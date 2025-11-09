# Dockerfile para Railway
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache mysql-client

# Criar diretório da aplicação
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads/products uploads/books uploads/banners

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["node", "server-simple.js"]


