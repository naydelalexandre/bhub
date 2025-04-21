# Resumo das Opções de Deploy para o BrokerBooster

Preparamos o projeto para ser facilmente implantado em diferentes serviços de hospedagem. Aqui está um resumo das opções e os arquivos de instruções detalhadas disponíveis:

## 1. Deploy no Netlify (Recomendado para simplicidade)

O Netlify é ideal para aplicações React modernas, oferecendo recursos integrados para SPAs.

**Opção mais rápida:** Use o Netlify Drop (arraste e solte a pasta `dist`)

**Documentação completa:** Veja o arquivo [DEPLOY-NETLIFY.md](./DEPLOY-NETLIFY.md)

## 2. Deploy no GitHub Pages (Excelente para projetos open-source)

GitHub Pages é gratuito e integra-se facilmente com seus repositórios GitHub.

**Documentação completa:** Veja o arquivo [DEPLOY-GITHUB.md](./DEPLOY-GITHUB.md)

## 3. Deploy em Servidor Web Tradicional

Para hospedar em qualquer servidor web (Apache, Nginx, IIS, etc):

1. Execute `npm run build`
2. Faça upload da pasta `dist` para seu servidor
3. Configure seu servidor web para redirecionar todas as requisições para `index.html`

## 4. Hospedagem Local para Demonstração

Para demonstrar o projeto localmente:

```
cd frontend
npm run dev:all
```

Isso iniciará tanto o frontend (em http://localhost:5173) quanto a mock API (em http://localhost:3000).

## Observações Importantes

- A aplicação está configurada como SPA (Single Page Application)
- O arquivo `vercel.json`, `netlify.toml` e `dist/.nojekyll` já estão configurados
- Após o deploy, verifique se as rotas estão funcionando corretamente
- A aplicação tem fallbacks configurados e funcionará mesmo sem uma API real

## Preparação da Pasta `dist`

Já preparamos a pasta `dist` com:

1. Um arquivo `.nojekyll` para suporte ao GitHub Pages
2. Um arquivo `404.html` para roteamento SPA no GitHub Pages
3. Caminhos relativos para os assets (use `./assets/` em vez de `/assets/`)
4. Inclusão da biblioteca Material Icons via CDN
5. Meta tags apropriadas para SEO 