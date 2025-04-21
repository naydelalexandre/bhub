const cron = require('node-cron');
const gamificationRepo = require('../db/gamification-repository');

/**
 * Tarefa para recalcular o ranking semanal
 * Executada todo domingo à meia-noite
 */
const recalculateRankingJob = cron.schedule('0 0 * * 0', async () => {
  console.log('[CRON] Iniciando recálculo do ranking semanal...');
  try {
    await gamificationRepo.recalculateWeeklyRanking();
    console.log('[CRON] Ranking semanal recalculado com sucesso!');
  } catch (error) {
    console.error('[CRON] Erro ao recalcular ranking semanal:', error);
  }
});

/**
 * Tarefa para aplicar decaimento de pontos semanais
 * Executada todo domingo à 1h da manhã
 */
const applyPointsDecayJob = cron.schedule('0 1 * * 0', async () => {
  console.log('[CRON] Iniciando aplicação de decaimento de pontos semanais...');
  try {
    await gamificationRepo.applyWeeklyPointsDecay();
    console.log('[CRON] Decaimento de pontos semanais aplicado com sucesso!');
  } catch (error) {
    console.error('[CRON] Erro ao aplicar decaimento de pontos semanais:', error);
  }
});

/**
 * Tarefa para verificar sequências de usuários
 * Executada diariamente à meia-noite
 */
const checkStreaksJob = cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Iniciando verificação de sequências de usuários...');
  try {
    // Obter todos os perfis de gamificação
    const db = gamificationRepo.db;
    const profiles = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM gamification_profiles', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Obter configurações para saber o tempo limite de inatividade
    const settings = await gamificationRepo.getGamificationSettings();
    const streakHours = settings.streak_requirement_hours || 24;
    const inactivityLimit = streakHours * 60 * 60 * 1000; // Converter para milissegundos
    
    const now = new Date();
    let updated = 0;
    let maintained = 0;
    
    // Verificar cada perfil
    for (const profile of profiles) {
      const lastActive = new Date(profile.last_active);
      const timeSinceLastActive = now - lastActive;
      
      // Se o usuário estiver inativo por mais tempo que o limite, resetar a sequência
      if (timeSinceLastActive > inactivityLimit) {
        // Somente resetar se a sequência for maior que 0
        if (profile.streak > 0) {
          await gamificationRepo.updateUserStreak(profile.user_id, false);
          updated++;
        }
      } else {
        maintained++;
      }
    }
    
    console.log(`[CRON] Verificação de sequências concluída: ${maintained} mantidas, ${updated} resetadas`);
  } catch (error) {
    console.error('[CRON] Erro ao verificar sequências de usuários:', error);
  }
});

/**
 * Iniciar todas as tarefas cron
 */
function startCronJobs() {
  recalculateRankingJob.start();
  applyPointsDecayJob.start();
  checkStreaksJob.start();
  console.log('Tarefas cron de gamificação iniciadas com sucesso!');
}

/**
 * Parar todas as tarefas cron
 */
function stopCronJobs() {
  recalculateRankingJob.stop();
  applyPointsDecayJob.stop();
  checkStreaksJob.stop();
  console.log('Tarefas cron de gamificação interrompidas!');
}

module.exports = {
  startCronJobs,
  stopCronJobs
}; 