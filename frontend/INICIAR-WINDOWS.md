# Instruções para iniciar o BrokerBooster no Windows

## Método 1: Usando o Script Automático

1. Abra o PowerShell como administrador (clique com botão direito no ícone do PowerShell e selecione "Executar como administrador")

2. Navegue até a pasta do projeto:
   ```powershell
   cd C:\caminho\para\BrokerBooster\frontend
   ```

3. Execute o script start-dev.ps1:
   ```powershell
   .\start-dev.ps1
   ```

4. Isso abrirá duas janelas do PowerShell:
   - Uma para o frontend (http://localhost:5173)
   - Uma para o mock API (http://localhost:3000)

## Método 2: Manual (Duas janelas do PowerShell)

### Iniciando o Mock API

1. Abra o PowerShell e navegue até a pasta do projeto:
   ```powershell
   cd C:\caminho\para\BrokerBooster\frontend
   ```

2. Execute o comando para iniciar o mock API:
   ```powershell
   npm run mock-api
   ```

### Iniciando o Frontend

1. Abra outra janela do PowerShell e navegue até a pasta do projeto:
   ```powershell
   cd C:\caminho\para\BrokerBooster\frontend
   ```

2. Execute o comando para iniciar o frontend:
   ```powershell
   npm run dev
   ```

## Possíveis Erros e Soluções

### Erro: "... não pode ser carregado porque a execução de scripts foi desabilitada neste sistema."

Execute o seguinte comando no PowerShell como administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "json-server não é reconhecido como um comando interno ou externo"

Instale o json-server globalmente:
```powershell
npm install -g json-server
```

### Erro: "NODE_ENV não é reconhecido como um comando interno ou externo"

O Windows não processa variáveis de ambiente da mesma forma que sistemas Unix. Use o pacote cross-env:
```powershell
npm install -g cross-env
```

E modifique seus scripts no package.json:
```json
"scripts": {
  "dev": "cross-env NODE_ENV=development vite",
  "build": "cross-env NODE_ENV=production vite build"
}
```

## Acessando a Aplicação

- **Frontend**: http://localhost:5173
- **Mock API**: http://localhost:3000

Use as credenciais de demonstração disponíveis no README. 