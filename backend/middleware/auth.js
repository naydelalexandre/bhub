const jwt = require('jsonwebtoken');

// Chave secreta para assinar os tokens JWT (ideal: usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 
  (process.env.NODE_ENV === 'production' 
    ? (() => { 
        console.error('ALERTA DE SEGURANÇA: JWT_SECRET não definido em produção!'); 
        console.error('Defina JWT_SECRET como variável de ambiente para maior segurança.');
        // Em produção, é crítico ter uma chave secreta segura
        // Se não definido, usar uma chave aleatória como fallback temporário
        return require('crypto').randomBytes(32).toString('hex');
      })() 
    : 'brokerbooster-dev-key-local-only');

/**
 * Middleware para verificar o token JWT
 */
const authenticateJWT = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // Formato esperado: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        // Logs para debug, mas mensagem genérica para o usuário
        console.error('Erro na verificação do token:', err.message);
        return res.status(403).json({ message: 'Token inválido ou expirado' });
      }
      
      // Adicionar usuário decodificado à requisição
      req.user = user;
      next();
    });
  } else {
    // Nenhum token fornecido
    res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }
};

/**
 * Middleware para verificar se o usuário tem um papel específico
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    // Este middleware deve ser usado após authenticateJWT
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    // Verificar se o papel do usuário está na lista de papéis permitidos
    if (Array.isArray(roles) && !roles.includes(req.user.role)) {
      console.log(`Acesso negado: usuário ${req.user.username} (${req.user.role}) tentou acessar recurso restrito a ${roles}`);
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Se for uma string única, verificar correspondência exata
    if (typeof roles === 'string' && req.user.role !== roles) {
      console.log(`Acesso negado: usuário ${req.user.username} (${req.user.role}) tentou acessar recurso restrito a ${roles}`);
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Usuário autorizado
    next();
  };
};

/**
 * Gerar token JWT para um usuário
 */
const generateToken = (user) => {
  // Remover dados sensíveis e selecionar apenas o que é necessário
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatarInitials: user.avatar_initials,
    managerId: user.manager_id,
    teamId: user.team_id
  };
  
  // Gerar token com expiração de 24 horas
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  generateToken
}; 