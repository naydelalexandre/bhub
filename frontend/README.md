# BrokerBooster - Frontend

Aplicativo de gamificação para corretores imobiliários.

## Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn

## Instalação

```bash
# Instalar dependências
npm install
```

## Executando o projeto

### Modo desenvolvimento com mock API

```bash
# Iniciar o mock API e o cliente frontend simultaneamente
npm run dev:all
```

### Apenas o frontend

```bash
# Iniciar apenas o frontend
npm run dev
```

### Apenas a mock API

```bash
# Iniciar apenas o servidor de API mock
npm run mock-api
```

## Build para produção

```bash
# Gerar build
npm run build
```

## Deploy

O projeto está configurado para deploy automático no Vercel. Basta conectar o repositório ao Vercel e o deploy será realizado automaticamente a cada push.

### Configuração manual do Vercel

Se você preferir fazer o deploy manualmente:

1. Instale a CLI do Vercel:
   ```bash
   npm i -g vercel
   ```

2. Faça login no Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

## Estrutura do projeto

- `/src`: Código-fonte principal
  - `/components`: Componentes reutilizáveis
  - `/contexts`: Contextos React, incluindo autenticação
  - `/hooks`: Custom hooks
  - `/lib`: Utilitários e serviços
  - `/pages`: Páginas principais
- `/mock-api`: API simulada para desenvolvimento

## Credenciais de demonstração

O sistema aceita qualquer email e senha para login, mas também oferece contas pré-configuradas:

- **Diretor:**
  - Email: diretor@exemplo.com
  - Senha: senha123

- **Gerente:**
  - Email: gerente@exemplo.com
  - Senha: senha123

- **Corretor:**
  - Email: corretor@exemplo.com
  - Senha: senha123 