---
description: Deploy Acutia Lens API on Coolify (from zero)
---

# Deploy Acutia Lens API — Guia Completo Coolify

## Pré-requisitos

- VM com Ubuntu 24.04, 2vCPU, 4GB RAM, 40GB disco
- Acesso SSH root à VM
- Repositório Git (GitHub) com o código da API
- (Opcional) Domínio apontando para o IP da VM

---

## Fase 1 — Preparar a VM

### 1.1 Conectar via SSH

```bash
ssh root@SEU_IP_DA_VM
```

### 1.2 Atualizar pacotes

```bash
apt update && apt upgrade -y
```

### 1.3 Configurar firewall (UFW)

Abra as portas necessárias:

```bash
ufw allow 22     # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw allow 8000   # Coolify Dashboard
ufw enable
ufw status
```

> Confirme com `y` quando perguntar sobre desconexão SSH.

### 1.4 Criar swap (recomendado com 4GB RAM)

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Verificar: `free -h` deve mostrar 2G de swap.

---

## Fase 2 — Instalar Coolify

### 2.1 Executar script de instalação

// turbo
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Este comando instala Docker, Docker Compose, e o Coolify automaticamente. Aguarde ~2-3 minutos.

### 2.2 Acessar o dashboard

Abra no navegador:

```
http://SEU_IP_DA_VM:8000
```

### 2.3 Criar conta admin

- Preencha o formulário de registro (email + senha)
- Este será seu acesso ao painel de administração

### 2.4 Validar o servidor

O Coolify vai verificar automaticamente se o servidor localhost está configurado corretamente. Clique em **"Validate Server"** ou **"Check"** e aguarde ficar verde.

---

## Fase 3 — Criar o banco PostgreSQL no Coolify

### 3.1 Criar novo recurso

1. No dashboard, clique em **"+ New"** → **"Database"**
2. Selecione **"PostgreSQL"**
3. Configure:
   - **Name:** `acutia-lens-db`
   - **Database:** `acutialens`
   - **User:** `acutialens`
   - **Password:** (gere uma senha forte)
   - **Port:** `5432` (padrão)
4. Clique em **"Start"**

### 3.2 Copiar a connection string

Após o PostgreSQL iniciar, vá em **"Connection Strings"** e copie a URL interna. Será algo como:

```
postgresql://acutialens:SENHA@nome-do-container:5432/acutialens
```

> Guarde essa URL — vai usar na variável `DATABASE_URL` da API.

---

## Fase 4 — Preparar o repositório

Antes de fazer deploy, o projeto precisa de um `Dockerfile`. Crie no diretório raiz do projeto:

### 4.1 Criar Dockerfile

Crie o arquivo `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3333

CMD ["node", "dist/main.js"]
```

### 4.2 Criar .dockerignore

```
node_modules
dist
.env
.git
*.md
```

### 4.3 Push para o GitHub

```bash
git add Dockerfile .dockerignore
git commit -m "chore: add Dockerfile for production"
git push origin main
```

---

## Fase 5 — Deploy da API no Coolify

### 5.1 Conectar repositório GitHub

1. No Coolify, vá em **Settings → Sources**
2. Clique em **"Add"** → **"GitHub App"**
3. Siga o fluxo OAuth para autorizar acesso ao repositório

### 5.2 Criar novo recurso (aplicação)

1. Clique em **"+ New"** → **"Application"**
2. Selecione seu repositório `acutia-lens-api`
3. Selecione a branch `main`
4. Build Pack: **Dockerfile**

### 5.3 Configurar variáveis de ambiente

Na aba **"Environment Variables"** da aplicação, adicione:

```
DATABASE_URL=postgresql://acutialens:SENHA@nome-do-container:5432/acutialens
JWT_SECRET=sua-chave-jwt-super-secreta-aqui
JWT_EXPIRES_IN=7d
PORT=3333
NODE_ENV=production
CORS_ORIGINS=https://seudominio.com
```

> **Importante:** A `DATABASE_URL` deve usar o hostname **interno** do container PostgreSQL (não `localhost`).

### 5.4 Configurar porta

Em **"General"** → **"Ports Exposes"**, defina: `3333`

### 5.5 Configurar domínio (opcional)

Se tiver um domínio:
1. Em **"Domains"**, adicione: `https://api.seudominio.com`
2. Aponte o DNS do domínio (registro A) para o IP da VM
3. O Coolify gera SSL automaticamente via Let's Encrypt

Se NÃO tiver domínio, use: `http://SEU_IP:3333`

### 5.6 Deploy!

Clique em **"Deploy"** e acompanhe os logs.

---

## Fase 6 — Rodar migrations e seed

### 6.1 Via terminal do Coolify

1. Na aplicação deployada, vá em **"Terminal"**
2. Execute:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 6.2 Verificar

Acesse no navegador:

```
https://api.seudominio.com/api/docs    # Swagger
https://api.seudominio.com/api/events  # Listar eventos
```

---

## Fase 7 — Configurar auto-deploy

### 7.1 Webhook automático

Se conectou via GitHub App (passo 5.1), o auto-deploy já está ativo. Todo `git push` na branch `main` dispara um novo deploy.

### 7.2 Health check

Em **"Health Checks"**, configure:
- **Path:** `/api/events`
- **Interval:** `30s`
- **Timeout:** `10s`

Isso garante que o Coolify reinicie o container automaticamente se a API cair.

---

## Resumo da arquitetura final

```
Internet → Traefik (SSL) → acutia-lens-api:3333
                          → acutia-lens-db:5432 (interno)
```

Tudo gerenciado pelo dashboard Coolify em `:8000`.
