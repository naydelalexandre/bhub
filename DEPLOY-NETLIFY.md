# Deploy no Netlify

O BrokerBooster pode ser facilmente hospedado no Netlify, que oferece hospedagem gratuita para sites estáticos.

## Método 1: Netlify Drop (Arraste e Solte)

Esta é a maneira mais rápida de colocar o site online:

1. Faça o build do projeto:
   ```
   npm run build
   ```

2. Acesse [Netlify Drop](https://app.netlify.com/drop)

3. Arraste e solte a pasta `dist` inteira para a área indicada no site do Netlify

4. Pronto! Seu site estará online em segundos com uma URL temporária como `https://nome-aleatorio.netlify.app`

## Método 2: Deploy via CLI do Netlify

1. Instale a CLI do Netlify:
   ```
   npm install -g netlify-cli
   ```

2. Faça login:
   ```
   netlify login
   ```

3. Inicie o deploy:
   ```
   netlify deploy
   ```

4. Quando perguntado sobre a pasta, digite `dist`

5. Para o deploy final em produção:
   ```
   netlify deploy --prod
   ```

## Método 3: Conectar ao GitHub

Para deployments contínuos:

1. Faça o push do seu código para um repositório GitHub
   
2. No Netlify:
   - Clique em "New site from Git"
   - Selecione GitHub como provedor
   - Escolha seu repositório
   - Configure as opções de build:
     - Build command: `npm run build`
     - Publish directory: `dist`
   
3. Clique em "Deploy site"

Sempre que você fizer um push para a branch principal, o Netlify fará o build e deploy automaticamente.

## Configurando domínio personalizado

1. No dashboard do Netlify, vá para "Domain settings"
2. Clique em "Add custom domain"
3. Siga as instruções para configurar seu domínio 