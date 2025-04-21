# Instruções para Deploy do BrokerBooster

## Pré-requisitos
- Conta no Vercel (https://vercel.com)
- Node.js instalado
- Vercel CLI (opcional para deploy via linha de comando)

## Passos para Deploy no Vercel

### 1. Preparar o Projeto
```bash
# Instalar dependências
npm install

# Gerar build de produção
npm run build
```

### 2. Deploy via Interface Web do Vercel

1. Acesse https://vercel.com e faça login
2. Clique em "Add New..." e selecione "Project"
3. Importe seu repositório GitHub/GitLab/Bitbucket
4. Configure as seguintes opções:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Environment Variables (opcional): adicione as variáveis do arquivo .env.example

5. Clique em "Deploy"

### 3. Deploy via CLI do Vercel

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Fazer login
vercel login

# Deploy (no diretório do projeto)
vercel

# Para produção
vercel --prod
```

### 4. Configurações Importantes

- **vercel.json**: Já está configurado para redirecionar todas as rotas para o index.html (SPA)
- **Variáveis de Ambiente**: Defina as variáveis em .env para desenvolvimento local e na interface do Vercel para produção

### 5. Domínio Personalizado (Opcional)

1. No dashboard do Vercel, acesse seu projeto
2. Vá para a aba "Settings" → "Domains"
3. Adicione seu domínio personalizado
4. Siga as instruções para configurar os registros DNS

## Para Windows (PowerShell)

Execute o script de deploy incluído:
```powershell
.\deploy.ps1
```

## Configurando API Mock para Demonstração

Para garantir que o projeto funcione mesmo sem um backend real:

1. Crie um projeto separado para o mock-api
2. Faça deploy do db.json e routes.json
3. Atualize a URL da API em `src/lib/api-config.ts`

## Verificação pós-deploy

Após o deploy, verifique se:
- A navegação funciona corretamente (todas as rotas)
- O login está funcionando
- A aplicação está responsiva em diferentes dispositivos 