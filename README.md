# BrokerBooster

Sistema de gerenciamento de atividades para corretores imobiliários com recursos avançados de gamificação.

## Estrutura do Projeto

```
BrokerBooster/
├── client/              # Frontend em React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Contextos React (Auth, Gamification, etc.)
│   │   ├── lib/         # Utilitários e configurações
│   │   └── pages/       # Páginas da aplicação
│   └── ...
└── server/              # Backend em Node.js
    ├── cron/            # Tarefas agendadas
    ├── db/              # Configuração e acesso ao banco de dados
    │   ├── schema.sql   # Esquema do banco de dados
    │   └── seed.sql     # Dados iniciais
    ├── logs/            # Diretório de logs (criado automaticamente)
    ├── middleware/      # Middlewares Express
    ├── routes/          # Rotas da API
    └── server.js        # Ponto de entrada do servidor
```

## Funcionalidades Principais

- **Dashboard Personalizado**: Visão geral adaptada por papel (Corretor, Gerente, Diretor)
- **Gestão de Atividades**: Criação, atribuição e acompanhamento de tarefas
- **Gestão de Negociações**: Registro e acompanhamento de vendas e contratos
- **Sistema de Gamificação**:
  - Conquistas e recompensas baseadas em atividades e negociações
  - Sistema de níveis com progressão
  - Ranking semanal de corretores
  - Histórico de pontos por atividades

## Pré-requisitos

- Node.js 14.x ou superior
- SQLite 3

## Configuração e Instalação

### Método Simplificado (Windows)

1. Execute o script de inicialização unificado:
   ```
   start-brokerbooster.bat
   ```

Este script irá:
- Verificar e encerrar processos em conflito
- Liberar portas em uso
- Iniciar todos os servidores de demonstração
- Exibir instruções para iniciar o servidor principal e o cliente

### Método Manual

#### Backend

1. Navegar para a pasta do servidor:
   ```
   cd server
   ```

2. Instalar dependências:
   ```
   npm install
   ```

3. Inicializar o banco de dados:
   ```
   npm run init-db
   ```

4. Iniciar o servidor:
   ```
   npm run dev
   ```

O servidor será iniciado na porta 3000 por padrão (http://localhost:3000).

#### Frontend

1. Navegar para a pasta do cliente:
   ```
   cd client
   ```

2. Instalar dependências:
   ```
   npm install
   ```

3. Iniciar o servidor de desenvolvimento:
   ```
   npm run dev
   ```

O frontend será servido na porta 5173 (ou outra porta disponível) e você poderá acessá-lo em http://localhost:5173.

## Variáveis de Ambiente

Para maior segurança, configure estas variáveis de ambiente:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| PORT | Porta do servidor | 3000 |
| NODE_ENV | Ambiente (development/production) | development |
| JWT_SECRET | Chave secreta para tokens JWT | (gerada automaticamente) |

## Sistema de Gamificação

O sistema de gamificação é um componente central do BrokerBooster, projetado para aumentar o engajamento e a produtividade dos corretores através de:

### Pontos e Níveis

Os usuários ganham pontos por:
- Completar atividades
- Fechar negociações
- Manter sequências de atividade diária
- Receber bônus por desempenho excepcional

Os níveis disponíveis são:
- Iniciante (0 pontos)
- Bronze (100 pontos)
- Prata (300 pontos)
- Ouro (600 pontos)
- Platina (1000 pontos)
- Diamante (1500 pontos)
- Mestre (2500 pontos)
- Lenda (4000 pontos)

### Conquistas

As conquistas são organizadas em categorias:
- **Atividades**: Relacionadas à conclusão de tarefas
- **Negociações**: Relacionadas à conclusão de vendas
- **Engajamento**: Relacionadas à consistência de uso
- **Crescimento**: Relacionadas à progressão de níveis

Cada conquista tem um nível de dificuldade (fácil, médio, difícil) e recompensa pontos ao ser completada.

### Ranking Semanal

Um ranking semanal exibe os corretores mais produtivos, incentivando a competição saudável.

## Sistema de Logs

O BrokerBooster implementa um sistema de logs estruturados que:
- Armazena logs em arquivos com rotação diária
- Separa logs de erro para fácil diagnóstico
- Monitora requisições lentas para otimização de performance
- Registra eventos do sistema com timestamps precisos

Os logs são armazenados no diretório `server/logs/`.

## API do Sistema de Gamificação

### Endpoints Principais

- `GET /api/gamification/profile` - Obter perfil de gamificação
- `GET /api/gamification/achievements` - Obter conquistas
- `GET /api/gamification/weekly-ranking` - Obter ranking semanal
- `GET /api/gamification/points-history` - Obter histórico de pontos
- `POST /api/gamification/register-activity` - Registrar atividade concluída
- `POST /api/gamification/register-deal` - Registrar negociação finalizada

### Endpoints Administrativos

- `POST /api/gamification/admin/award-bonus` - Conceder bônus a um usuário
- `POST /api/gamification/admin/update-settings` - Atualizar configurações
- `POST /api/gamification/admin/recalculate-ranking` - Recalcular ranking

## Segurança

O BrokerBooster implementa várias medidas de segurança:
- Autenticação JWT com chaves seguras
- Controle de acesso baseado em papéis
- Validação de dados nas requisições API
- Armazenamento seguro de senhas com bcrypt
- Proteção contra ataques comuns com helmet

## Usuários de Demonstração

Para fins de teste, o sistema inclui os seguintes usuários:

- **Diretor**: username: `diretor`, senha: `senha123`
- **Gerentes**: username: `gerente1` ou `gerente2`, senha: `senha123`
- **Corretores**: username: `corretor1` a `corretor4`, senha: `senha123`

## Servidores de Demonstração

O projeto inclui vários servidores de demonstração para visualizar diferentes aspectos:

- **Servidor Python**: http://localhost:3001/demo.html
- **Exemplos Visuais**: http://localhost:3003
- **B.Hub Demonstração**: http://localhost:3004
- **B.Hub Exemplos Visuais**: http://localhost:3005
- **Gamificação**: http://localhost:3007

## Licença

MIT 