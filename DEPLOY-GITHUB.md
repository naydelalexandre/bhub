# Deploy no GitHub Pages

O BrokerBooster pode ser hospedado no GitHub Pages, que é gratuito para repositórios públicos.

## Pré-requisitos

1. Uma conta no GitHub
2. Git instalado no seu computador
3. Seu projeto em um repositório GitHub

## Método 1: Configuração manual

1. Faça o build do projeto:
   ```
   npm run build
   ```

2. Adicione um arquivo `.nojekyll` na pasta `dist` para evitar processamento Jekyll:
   ```
   touch dist/.nojekyll
   ```

3. Faça o deploy da pasta `dist` para a branch `gh-pages`:
   ```
   npm install -g gh-pages
   gh-pages -d dist
   ```

4. Acesse as configurações do seu repositório no GitHub:
   - Vá para "Settings" > "Pages"
   - Em "Source", selecione a branch `gh-pages`
   - Clique em "Save"

5. Seu site estará disponível em `https://seu-usuario.github.io/nome-do-repositorio/`

## Método 2: Configuração com GitHub Actions

1. Crie um arquivo `.github/workflows/deploy.yml` no seu repositório:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install and Build 🔧
        run: |
          npm ci
          npm run build
          touch dist/.nojekyll

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: dist
```

2. Faça push para o GitHub:
   ```
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Pages workflow"
   git push
   ```

3. O GitHub Action irá automaticamente fazer o build e deploy do seu site

## Configurando rotas SPA no GitHub Pages

Como o GitHub Pages não suporta nativamente redirecionamentos para SPAs, você pode usar um truque com o arquivo 404.html:

1. Copie o conteúdo do index.html para um novo arquivo chamado 404.html na pasta dist
2. Isso fará com que qualquer rota inexistente mostre sua aplicação React

## Usando domínio personalizado

1. No GitHub, vá para "Settings" > "Pages"
2. Na seção "Custom domain", digite seu domínio
3. Adicione os registros DNS necessários no seu provedor de domínio
4. Espere a propagação DNS (pode levar até 24 horas) 