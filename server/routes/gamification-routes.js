const express = require('express');
const router = express.Router();
// Usar o repositório Supabase em vez do SQLite
// const gamificationRepo = require('../db/gamification-repository');
const gamificationRepo = require('../gamification-repository-supabase');
const { authenticateJWT } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas de gamificação
router.use(authenticateJWT);

// Validação de dados
// Implementação básica - em produção, use uma biblioteca como Joi ou express-validator
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = validateObject(req.body, schema);
    if (error) {
      console.log(`Erro de validação: ${error}`);
      return res.status(400).json({ message: `Dados inválidos: ${error}` });
    }
    next();
  };
};

// Função auxiliar de validação
function validateObject(data, schema) {
  // Checagem básica de campos obrigatórios e tipos
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    // Verificar se é obrigatório
    if (rules.required && (data[field] === undefined || data[field] === null)) {
      errors.push(`Campo '${field}' é obrigatório`);
      continue;
    }

    // Se o campo não existir e não for obrigatório, pular
    if (data[field] === undefined) continue;

    // Verificar tipo
    if (rules.type) {
      const expectedType = rules.type;
      let actualType = typeof data[field];
      
      if (expectedType === 'array' && !Array.isArray(data[field])) {
        errors.push(`Campo '${field}' deve ser um array`);
      } else if (expectedType === 'number' && actualType !== 'number') {
        // Tentar converter para número se for string numérica
        if (actualType === 'string' && !isNaN(data[field])) {
          data[field] = Number(data[field]);
        } else {
          errors.push(`Campo '${field}' deve ser um número`);
        }
      } else if (expectedType !== 'array' && expectedType !== actualType) {
        errors.push(`Campo '${field}' deve ser do tipo ${expectedType}`);
      }
    }

    // Verificar valores mínimos e máximos para números
    if (rules.type === 'number') {
      if (rules.min !== undefined && data[field] < rules.min) {
        errors.push(`Campo '${field}' deve ser maior ou igual a ${rules.min}`);
      }
      if (rules.max !== undefined && data[field] > rules.max) {
        errors.push(`Campo '${field}' deve ser menor ou igual a ${rules.max}`);
      }
    }

    // Verificar tamanho mínimo e máximo para strings
    if (rules.type === 'string') {
      if (rules.minLength !== undefined && data[field].length < rules.minLength) {
        errors.push(`Campo '${field}' deve ter pelo menos ${rules.minLength} caracteres`);
      }
      if (rules.maxLength !== undefined && data[field].length > rules.maxLength) {
        errors.push(`Campo '${field}' deve ter no máximo ${rules.maxLength} caracteres`);
      }
    }
  }

  return errors.length ? { error: errors.join('; ') } : { error: null };
}

// Schemas de validação
const activitySchema = {
  activityId: { type: 'number', required: true },
  activityTitle: { type: 'string', required: true, maxLength: 255 },
  points: { type: 'number', required: true, min: 1, max: 1000 }
};

const dealSchema = {
  dealId: { type: 'number', required: true },
  dealTitle: { type: 'string', required: true, maxLength: 255 },
  points: { type: 'number', required: true, min: 1, max: 1000 },
  value: { type: 'number', required: false, min: 0 }
};

const bonusSchema = {
  targetUserId: { type: 'number', required: true },
  points: { type: 'number', required: true, min: 1, max: 500 },
  reason: { type: 'string', required: true, minLength: 5, maxLength: 255 }
};

const settingsSchema = {
  levelThresholds: { type: 'object', required: true },
  pointsDecayRate: { type: 'number', required: true, min: 0, max: 1 },
  streakRequirementHours: { type: 'number', required: false, min: 1, max: 72 }
};

// ==== ROTAS DE PERFIL ====

/**
 * @route GET /api/gamification/profile
 * @desc Obter perfil de gamificação do usuário autenticado
 * @access Privado
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await gamificationRepo.getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Perfil de gamificação não encontrado' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil de gamificação' });
  }
});

// ==== ROTAS DE CONQUISTAS ====

/**
 * @route GET /api/gamification/achievements
 * @desc Obter todas as conquistas com o progresso do usuário
 * @access Privado
 */
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await gamificationRepo.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ message: 'Erro ao buscar conquistas' });
  }
});

// ==== ROTAS DE RANKING ====

/**
 * @route GET /api/gamification/weekly-ranking
 * @desc Obter ranking semanal
 * @access Privado
 */
router.get('/weekly-ranking', async (req, res) => {
  try {
    // Validação básica do parâmetro de consulta
    let limit = 20;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(400).json({ message: 'Limite inválido. Deve ser um número entre 1 e 100.' });
      }
      limit = parsedLimit;
    }
    
    const ranking = await gamificationRepo.getWeeklyRanking(limit);
    res.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ message: 'Erro ao buscar ranking semanal' });
  }
});

// ==== ROTAS DE HISTÓRICO DE PONTOS ====

/**
 * @route GET /api/gamification/points-history
 * @desc Obter histórico de pontos do usuário
 * @access Privado
 */
router.get('/points-history', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validação básica do parâmetro de consulta
    let limit = 50;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
        return res.status(400).json({ message: 'Limite inválido. Deve ser um número entre 1 e 1000.' });
      }
      limit = parsedLimit;
    }
    
    const history = await gamificationRepo.getUserPointsHistory(userId, limit);
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico de pontos:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de pontos' });
  }
});

// ==== ROTAS PARA AÇÕES QUE GERAM PONTOS (integração com outros módulos) ====

/**
 * @route POST /api/gamification/register-activity
 * @desc Registrar conclusão de atividade e atribuir pontos
 * @access Privado
 */
router.post('/register-activity', validateRequest(activitySchema), async (req, res) => {
  try {
    const { activityId, activityTitle, points } = req.body;
    const userId = req.user.id;
    
    // Registrar a atividade e adicionar pontos
    await gamificationRepo.addPointsHistory(
      userId,
      points,
      `Atividade concluída: ${activityTitle || 'Sem título'}`,
      'activity',
      activityId
    );
    
    // Verificar conquistas relacionadas a atividades
    await gamificationRepo.checkAchievements(userId, 'activity_completed', 1);
    
    // Atualizar sequência se necessário
    await gamificationRepo.updateUserStreak(userId, true);
    
    // Verificar se o usuário subiu de nível
    await gamificationRepo.checkAndUpdateUserLevel(userId);
    
    // Obter perfil atualizado
    const updatedProfile = await gamificationRepo.getUserProfile(userId);
    
    res.json({
      success: true,
      message: 'Pontos adicionados com sucesso',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    res.status(500).json({ message: 'Erro ao registrar atividade' });
  }
});

/**
 * @route POST /api/gamification/register-deal
 * @desc Registrar conclusão de negociação e atribuir pontos
 * @access Privado
 */
router.post('/register-deal', validateRequest(dealSchema), async (req, res) => {
  try {
    const { dealId, dealTitle, points, value } = req.body;
    const userId = req.user.id;
    
    // Registrar a negociação e adicionar pontos
    await gamificationRepo.addPointsHistory(
      userId,
      points,
      `Negociação finalizada: ${dealTitle || 'Sem título'}`,
      'deal',
      dealId
    );
    
    // Verificar conquistas relacionadas a negociações
    await gamificationRepo.checkAchievements(userId, 'deal_completed', 1);
    
    // Verificar conquista de valor em vendas, se aplicável
    if (value && value > 0) {
      // Adicionar valor à conquista específica de valor em vendas (como Milhão)
      // Lógica específica poderia ser implementada aqui...
    }
    
    // Atualizar sequência
    await gamificationRepo.updateUserStreak(userId, true);
    
    // Verificar se o usuário subiu de nível
    await gamificationRepo.checkAndUpdateUserLevel(userId);
    
    // Obter perfil atualizado
    const updatedProfile = await gamificationRepo.getUserProfile(userId);
    
    res.json({
      success: true,
      message: 'Pontos adicionados com sucesso',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Erro ao registrar negociação:', error);
    res.status(500).json({ message: 'Erro ao registrar negociação' });
  }
});

// ==== ROTAS ADMINISTRATIVAS (somente para gerentes e diretores) ====

/**
 * @route POST /api/gamification/admin/award-bonus
 * @desc Atribuir bônus de pontos a um usuário
 * @access Privado - Apenas gerentes e diretores
 */
router.post('/admin/award-bonus', validateRequest(bonusSchema), async (req, res) => {
  try {
    // Verificar se o usuário tem permissão
    if (req.user.role !== 'manager' && req.user.role !== 'director') {
      return res.status(403).json({ message: 'Sem permissão para esta ação' });
    }
    
    const { targetUserId, points, reason } = req.body;
    
    // Adicionar bônus ao histórico de pontos
    await gamificationRepo.addPointsHistory(
      targetUserId,
      points,
      `Bônus: ${reason}`,
      'bonus',
      null
    );
    
    // Verificar se o usuário subiu de nível
    await gamificationRepo.checkAndUpdateUserLevel(targetUserId);
    
    res.json({
      success: true,
      message: 'Bônus atribuído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atribuir bônus:', error);
    res.status(500).json({ message: 'Erro ao atribuir bônus' });
  }
});

/**
 * @route POST /api/gamification/admin/update-settings
 * @desc Atualizar configurações de gamificação
 * @access Privado - Apenas diretores
 */
router.post('/admin/update-settings', validateRequest(settingsSchema), async (req, res) => {
  try {
    // Verificar se o usuário tem permissão
    if (req.user.role !== 'director') {
      return res.status(403).json({ message: 'Sem permissão para esta ação' });
    }
    
    const { levelThresholds, pointsDecayRate, streakRequirementHours } = req.body;
    
    // Atualizar configurações
    await gamificationRepo.updateGamificationSettings({
      levelThresholds,
      pointsDecayRate,
      streakRequirementHours: streakRequirementHours || 24
    });
    
    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações' });
  }
});

/**
 * @route POST /api/gamification/admin/recalculate-ranking
 * @desc Recalcular ranking semanal
 * @access Privado - Apenas diretores
 */
router.post('/admin/recalculate-ranking', async (req, res) => {
  try {
    // Verificar se o usuário tem permissão
    if (req.user.role !== 'director') {
      return res.status(403).json({ message: 'Sem permissão para esta ação' });
    }
    
    // Recalcular ranking
    await gamificationRepo.recalculateWeeklyRanking();
    
    res.json({
      success: true,
      message: 'Ranking recalculado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao recalcular ranking:', error);
    res.status(500).json({ message: 'Erro ao recalcular ranking' });
  }
});

module.exports = router; 