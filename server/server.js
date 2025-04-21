const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const { testSupabaseConnection } = require('./supabase');
const gamificationRepository = require('./gamification-repository-supabase');
const { startCronJobs } = require('./cron/gamification-jobs');

// Sistema de logs estruturados
const winston = require('winston');
require('winston-daily-rotate-file');

// Configurações de log
const logDir = path.join(__dirname, 'logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configura o formato do log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Transport para rotação diária de arquivos
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'brokerbooster-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m'
});

// Criar logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'brokerbooster-api' },
  transports: [
    // Logs de erro em arquivo separado
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // Logs rotacionados para todos os níveis
    fileRotateTransport,
    // Console para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Adicionar logger ao global para uso em toda a aplicação
global.logger = logger;

// Importar rotas
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const activityRoutes = require('./routes/activity-routes');
const dealRoutes = require('./routes/deal-routes');
const gamificationRoutes = require('./routes/gamification-routes');

// Inicializar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // CORS
app.use(morgan('combined', { 
  stream: { 
    write: message => logger.http(message.trim()) 
  } 
})); // Logging de HTTP com Winston
app.use(express.json()); // Parsing de JSON

// Middleware para logging de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logger.warn({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        user: req.user?.id || 'anônimo'
      });
    } else if (duration > 1000) {
      // Log de requisições lentas
      logger.info({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        slowRequest: true,
        duration: `${duration}ms`,
        user: req.user?.id || 'anônimo'
      });
    }
  });
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/gamification', gamificationRoutes);

// Rota básica para verificar se o servidor está rodando
app.get('/', (req, res) => {
  res.json({ message: 'BrokerBooster API está rodando!' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  // Log completo do erro
  logger.error({
    message: 'Erro na aplicação',
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'anônimo'
  });
  
  // Resposta ao cliente
  res.status(500).json({
    message: 'Ocorreu um erro no servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Inicializar tudo e iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com Supabase ao invés de inicializar SQLite
    // await initializeDatabase();
    const connected = await testSupabaseConnection();
    if (!connected) {
      throw new Error('Falha ao conectar com Supabase');
    }
    logger.info('Conexão com Supabase estabelecida com sucesso!');
    
    // Iniciar tarefas cron da gamificação
    startCronJobs();
    logger.info('Tarefas cron da gamificação iniciadas');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info(`Acesse: http://localhost:${PORT}`);
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratar exceções não capturadas
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  console.error('Exceção não capturada:', error);
  // Esperar que os logs sejam gravados antes de encerrar
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Tratar rejeições de promessas não capturadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição de promessa não tratada:', { reason, promise });
  console.error('Rejeição de promessa não tratada:', reason);
});

// Iniciar o servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

// Exportar para testes
module.exports = app; 