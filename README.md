# Acutia Lens API

API backend da plataforma **Acutia Lens** — um marketplace de fotos profissionais de eventos esportivos. O torcedor acessa o site, envia uma selfie, a IA encontra suas fotos nos eventos recentes via reconhecimento facial, e ele pode comprá-las em alta resolução.

---

## Índice

- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Executando a API](#executando-a-api)
- [Banco de Dados e Prisma](#banco-de-dados-e-prisma)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Endpoints da API](#endpoints-da-api)
- [Testando a API](#testando-a-api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Roadmap](#roadmap)

---

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|---|---|---|
| **Node.js** | 20+ | Runtime JavaScript server-side |
| **NestJS** | 11 | Framework back-end opinado e modular, inspirado no Angular. Organiza o código em módulos, controllers e services com injeção de dependências |
| **TypeScript** | 5.7 | Superset do JavaScript que adiciona tipagem estática, prevenindo erros em tempo de desenvolvimento |
| **Prisma** | 7 | ORM (Object-Relational Mapping) moderno para Node.js — veja seção dedicada abaixo |
| **PostgreSQL** | 16 | Banco de dados relacional robusto e open-source |
| **Passport + JWT** | — | Estratégias de autenticação: login com email/senha e tokens JWT para sessão stateless |
| **Swagger/OpenAPI** | — | Documentação interativa da API gerada automaticamente a partir dos decorators do código |
| **class-validator** | — | Validação automática dos dados de entrada (DTOs) com decorators como `@IsEmail()`, `@MinLength()` |
| **class-transformer** | — | Transforma dados entre formatos (plain objects ↔ class instances), permitindo conversão implícita de tipos |
| **bcryptjs** | — | Hashing seguro de senhas com salt rounds |
| **Docker** | — | Containerização do banco PostgreSQL para desenvolvimento local |

---

## Banco de Dados e Prisma

### O que é o Prisma?

O **Prisma** é um ORM (Object-Relational Mapping) de próxima geração para Node.js e TypeScript. Ele substitui a necessidade de escrever SQL manualmente, fornecendo:

1. **Schema declarativo** (`prisma/schema.prisma`) — você define seus modelos de dados em um arquivo `.prisma` e o Prisma gera automaticamente as tabelas no banco de dados.

2. **Prisma Client** — um cliente de banco de dados auto-gerado e type-safe. Cada query é validada pelo TypeScript em tempo de compilação, eliminando erros de SQL.

3. **Migrations** — o Prisma rastreia alterações no schema e gera migrações SQL automaticamente via `prisma migrate dev`.

4. **Prisma Studio** — interface visual para navegar e editar os dados do banco (opcional).

### Fluxo típico com Prisma

```
1. Editar prisma/schema.prisma  →  Definir/alterar modelos
2. npx prisma migrate dev       →  Gerar e aplicar migração SQL
3. npx prisma generate          →  Regenerar o Prisma Client
4. Usar PrismaService no código →  Queries type-safe
```

### Exemplo prático

No schema, definimos um modelo:

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(CLIENT)
  createdAt    DateTime @default(now())
}
```

No código TypeScript, o Prisma Client gera queries como:

```typescript
// Buscar usuário por email (totalmente tipado)
const user = await this.prisma.user.findUnique({
  where: { email: 'joao@email.com' },
});

// Criar novo usuário
const newUser = await this.prisma.user.create({
  data: {
    name: 'João',
    email: 'joao@email.com',
    passwordHash: hashedPassword,
  },
});
```

### Prisma 7 — Mudança importante

A partir do Prisma 7, a URL do banco de dados **não é mais definida diretamente** no `schema.prisma`. Em vez disso, existe um arquivo `prisma.config.ts` na raiz do projeto que fornece a URL via variável de ambiente:

```typescript
// prisma.config.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async datasourceUrl() {
      return process.env.DATABASE_URL!;
    },
  },
});
```

### Modelos do banco

| Modelo | Descrição |
|---|---|
| `User` | Usuários do sistema (clientes, fotógrafos, admins) |
| `Photographer` | Perfil de fotógrafo vinculado a um User |
| `Event` | Eventos esportivos com data, local e status |
| `Photo` | Fotos dos eventos com URL pública (marca d'água) e URL original (alta resolução) |
| `Order` | Pedidos de compra com cálculo de taxa da plataforma (5%) |
| `OrderItem` | Itens individuais de cada pedido (snapshot do preço) |
| `Favorite` | Fotos favoritadas pelo usuário |

---

## Arquitetura do Projeto

```
acutia-lens-api/
├── prisma/
│   ├── schema.prisma          # Definição dos modelos de dados
│   └── seed.ts                # Script para popular o banco com dados iniciais
├── prisma.config.ts           # Configuração do Prisma 7 (datasource URL)
├── src/
│   ├── main.ts                # Bootstrap: Swagger, CORS, ValidationPipe
│   ├── app.module.ts          # Módulo raiz importando todos os módulos
│   ├── config/
│   │   └── env.validation.ts  # Valida variáveis de ambiente no boot
│   ├── prisma/
│   │   ├── prisma.module.ts   # Módulo global do Prisma
│   │   └── prisma.service.ts  # Service que estende PrismaClient
│   ├── common/
│   │   ├── decorators/        # @Public(), @Roles(), @CurrentUser()
│   │   ├── guards/            # JwtAuthGuard (global), RolesGuard
│   │   ├── filters/           # HttpExceptionFilter (erros padronizados)
│   │   └── interceptors/      # TransformInterceptor ({ data, statusCode })
│   └── modules/
│       ├── auth/              # Registro, login, JWT, refresh token
│       ├── users/             # Service interno (sem controller)
│       ├── events/            # CRUD de eventos (admin)
│       ├── photos/            # CRUD + upload de fotos (fotógrafo)
│       ├── storage/           # Upload de arquivos (stub local → S3)
│       ├── search/            # Busca facial (mock → Rekognition)
│       ├── orders/            # Criação e consulta de pedidos
│       ├── favorites/         # Favoritar/desfavoritar fotos
│       ├── admin/             # Métricas, receita, gestão de fotógrafos
│       └── payments/          # Stub de pagamentos (→ Mercado Pago)
├── docker-compose.yml         # PostgreSQL para dev local
├── .env.example               # Template de variáveis de ambiente
└── package.json
```

### Como o NestJS organiza o código

O NestJS segue o padrão **Module → Controller → Service**:

- **Module** (`*.module.ts`) — agrupa e registra controllers e services relacionados
- **Controller** (`*.controller.ts`) — define as rotas HTTP e valida os dados de entrada (DTOs)
- **Service** (`*.service.ts`) — contém a lógica de negócio e acessa o banco via Prisma

```
Request HTTP → Controller (valida DTO) → Service (lógica) → PrismaService (banco) → Response
```

---

## Pré-requisitos

- **Node.js** 20 ou superior — [Download](https://nodejs.org/)
- **Docker** e **Docker Compose** — [Download](https://www.docker.com/) — para o banco PostgreSQL local
- **Git** — para clonar o repositório

---

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone <url-do-repositório>
cd acutia-lens-api
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o template e ajuste se necessário:

```bash
cp .env.example .env
```

O arquivo `.env` já vem configurado para funcionar com o Docker Compose local:

```env
DATABASE_URL=postgresql://acutia:acutia@localhost:5432/acutia_lens
JWT_SECRET=dev-secret-acutia-lens-2025
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=dev-refresh-secret-acutia-lens-2025
JWT_REFRESH_EXPIRATION=7d
PORT=3333
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

### 4. Subir o banco de dados

```bash
docker compose up -d
```

Isso inicia um container PostgreSQL na porta `5432` com as credenciais definidas no `docker-compose.yml`.

### 5. Criar as tabelas (migração)

```bash
npx prisma migrate dev --name init
```

Este comando:
- Lê o `prisma/schema.prisma`
- Gera um arquivo SQL na pasta `prisma/migrations/`
- Aplica a migração no banco de dados
- Regenera o Prisma Client automaticamente

### 6. Popular o banco com dados iniciais (seed)

```bash
npx prisma db seed
```

O seed cria:
- 1 usuário **Admin**
- 1 usuário **Cliente**
- 4 **Fotógrafos** (3 aprovados, 1 pendente)
- 5 **Eventos** esportivos
- ~20 **Fotos** distribuídas entre os eventos

---

## Executando a API

### Modo desenvolvimento (com hot-reload)

```bash
npm run start:dev
```

### Modo produção

```bash
npm run build
npm run start:prod
```

Após iniciar, a API estará disponível em:

| Recurso | URL |
|---|---|
| **API** | http://localhost:3333/api |
| **Swagger (documentação)** | http://localhost:3333/api/docs |

---

## Autenticação e Autorização

A API usa **JWT (JSON Web Tokens)** com dois tokens:

| Token | Validade | Uso |
|---|---|---|
| `accessToken` | 15 minutos | Enviado em cada request no header `Authorization: Bearer <token>` |
| `refreshToken` | 7 dias | Usado para obter um novo `accessToken` sem fazer login novamente |

### Roles (papéis)

| Role | Permissões |
|---|---|
| `CLIENT` | Navegar, favoritar, comprar fotos |
| `PHOTOGRAPHER` | Tudo do CLIENT + upload e remoção de fotos próprias |
| `ADMIN` | Acesso total: CRUD de eventos, métricas, gestão de fotógrafos |

### Rotas públicas vs protegidas

- Rotas marcadas com `@Public()` **não exigem autenticação** (ex: listar eventos, listar fotos)
- Todas as demais rotas exigem o header `Authorization: Bearer <accessToken>`
- Rotas com `@Roles(Role.ADMIN)` exigem que o usuário logado seja administrador

---

## Endpoints da API

Todos os endpoints são prefixados com `/api`.

### Auth (`/api/auth`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/register` | Cadastro de novo usuário | ❌ |
| `POST` | `/login` | Login → retorna `accessToken` + `refreshToken` | ❌ |
| `POST` | `/refresh` | Renova `accessToken` usando `refreshToken` | ❌ |
| `GET` | `/me` | Retorna dados do usuário logado | ✅ |
| `PATCH` | `/me` | Atualiza perfil (name, avatarUrl) | ✅ |

### Events (`/api/events`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/` | Lista eventos (filtros: status, search, page, limit) | ❌ |
| `GET` | `/:id` | Detalhe de um evento | ❌ |
| `POST` | `/` | Cria evento | 🔒 Admin |
| `PATCH` | `/:id` | Atualiza evento | 🔒 Admin |
| `DELETE` | `/:id` | Remove evento | 🔒 Admin |

### Photos (`/api/photos`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/` | Lista fotos (filtros: eventId, tag, sort, page, limit) | ❌ |
| `GET` | `/:id` | Detalhe da foto (URL com marca d'água) | ❌ |
| `POST` | `/upload` | Upload de foto (multipart/form-data) | 🔒 Fotógrafo |
| `DELETE` | `/:id` | Remove foto | 🔒 Fotógrafo/Admin |

### Search (`/api/search`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/face` | Busca facial — envia selfie, recebe fotos com `matchScore` | ❌* |

*Requer `lgpdConsent: true` no body. A selfie **não é armazenada** no servidor.

### Orders (`/api/orders`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/` | Cria pedido com itens do carrinho | ✅ |
| `GET` | `/` | Lista pedidos do usuário | ✅ |
| `GET` | `/:id` | Detalhe do pedido (URLs de download se aprovado) | ✅ |

### Favorites (`/api/favorites`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/` | Lista favoritos do usuário | ✅ |
| `POST` | `/:photoId` | Adiciona/remove favorito (toggle) | ✅ |
| `DELETE` | `/:photoId` | Remove favorito | ✅ |

### Admin (`/api/admin`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/stats` | Métricas: eventos, fotos, vendas, receita | 🔒 Admin |
| `GET` | `/revenue-by-event` | Receita agrupada por evento | 🔒 Admin |
| `GET` | `/photographers` | Lista fotógrafos com status | 🔒 Admin |
| `PATCH` | `/photographers/:id/status` | Altera status (aprovado/pendente) | 🔒 Admin |

### Webhooks (`/api/webhooks`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/mercadopago` | Webhook Mercado Pago (stub para Fase 2) | — |

---

## Testando a API

### Usando o Swagger UI

A forma mais fácil de testar é via Swagger:

1. Inicie a API: `npm run start:dev`
2. Acesse http://localhost:3333/api/docs
3. Na interface, você verá todos os endpoints agrupados por módulo

**Para testar rotas autenticadas:**

1. Execute `POST /api/auth/login` com o body:
   ```json
   {
     "email": "admin@acutialens.com",
     "password": "admin123"
   }
   ```
2. Copie o `accessToken` da resposta
3. Clique no botão **"Authorize"** (🔓) no topo do Swagger
4. Cole o token no campo e clique em **"Authorize"**
5. Agora todas as requests incluirão o header `Authorization: Bearer <token>`

### Credenciais de teste (seed)

| Role | Email | Senha |
|---|---|---|
| Admin | `admin@acutialens.com` | `admin123` |
| Cliente | `joao@email.com` | `cliente123` |
| Fotógrafo | `ricardo@foto.com` | `foto123` |
| Fotógrafo | `ana@foto.com` | `foto123` |
| Fotógrafo (pendente) | `carlos@foto.com` | `foto123` |
| Fotógrafo | `juliana@foto.com` | `foto123` |

### Usando cURL

```bash
# Registrar novo usuário
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@email.com","password":"senha123"}'

# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acutialens.com","password":"admin123"}'

# Listar eventos (público)
curl http://localhost:3333/api/events

# Listar fotos de um evento (público)
curl "http://localhost:3333/api/photos?eventId=<EVENT_ID>"

# Ver perfil (autenticado)
curl http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer <SEU_ACCESS_TOKEN>"

# Métricas admin
curl http://localhost:3333/api/admin/stats \
  -H "Authorization: Bearer <TOKEN_DO_ADMIN>"
```

### Visualizar dados no Prisma Studio

O Prisma inclui uma interface visual para navegar pelo banco de dados:

```bash
npx prisma studio
```

Acesse http://localhost:5555 para visualizar e editar registros diretamente.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL |
| `JWT_SECRET` | ✅ | Segredo para assinar access tokens |
| `JWT_EXPIRATION` | ❌ | Validade do access token (padrão: `15m`) |
| `JWT_REFRESH_SECRET` | ❌ | Segredo para refresh tokens (padrão: usa `JWT_SECRET`) |
| `JWT_REFRESH_EXPIRATION` | ❌ | Validade do refresh token (padrão: `7d`) |
| `PORT` | ❌ | Porta da API (padrão: `3333`) |
| `CORS_ORIGIN` | ❌ | Origem permitida para CORS (padrão: `http://localhost:8080`) |
| `NODE_ENV` | ❌ | Ambiente: `development`, `production`, `test` |

---

## Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Dev | `npm run start:dev` | Inicia com hot-reload |
| Build | `npm run build` | Compila TypeScript para `dist/` |
| Prod | `npm run start:prod` | Inicia a versão compilada |
| Lint | `npm run lint` | Verifica e corrige estilo do código |
| Format | `npm run format` | Formata código com Prettier |
| Test | `npm run test` | Executa testes unitários |
| Test E2E | `npm run test:e2e` | Executa testes end-to-end |

---

## Roadmap

### ✅ Fase 1 — Fundação (MVP) — *Atual*
- NestJS + Prisma + PostgreSQL
- Autenticação JWT com refresh token
- CRUD de eventos, fotos, pedidos, favoritos
- Painel admin com métricas
- Busca facial mockada
- Swagger/OpenAPI
- Seed com dados iniciais

### 🔜 Fase 2 — Pagamentos
- Integração Mercado Pago (PIX + Cartão)
- Webhook para atualizar status do pedido
- Liberação de URLs de alta resolução após pagamento

### 🔜 Fase 3 — Busca Facial
- Integração AWS Rekognition
- Indexação de faces no upload
- Busca real por selfie
- Conformidade LGPD (descarte imediato da selfie)

### 🔜 Fase 4 — Produção
- Deploy em Railway/Render/Fly.io
- CI/CD com GitHub Actions
- Rate limiting e segurança
- Monitoramento e logs

---

## Licença

Projeto privado — todos os direitos reservados.
