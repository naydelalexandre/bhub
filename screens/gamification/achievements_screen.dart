import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/gamification_provider.dart';
import '../../models/gamification/achievement.dart';
import '../../models/gamification/profile.dart';

class AchievementsScreen extends StatefulWidget {
  @override
  _AchievementsScreenState createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen> {
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final provider = Provider.of<GamificationProvider>(context, listen: false);
      await provider.loadAchievements();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar conquistas: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Conquistas'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: _buildContent(),
            ),
    );
  }
  
  Widget _buildContent() {
    final provider = Provider.of<GamificationProvider>(context);
    final achievementGroups = provider.getAchievementsByGroup();
    
    // Filtrar grupos vazios e ordenar por tipo
    final nonEmptyGroups = achievementGroups
        .where((group) => group.achievements.isNotEmpty)
        .toList();
    
    if (nonEmptyGroups.isEmpty) {
      return Center(
        child: Text('Nenhuma conquista disponível'),
      );
    }
    
    // Obter estatísticas
    final totalAchievements = provider.achievements.length;
    final completedAchievements = provider.completedAchievementsCount;
    final completionPercentage = totalAchievements > 0
        ? (completedAchievements / totalAchievements * 100).round()
        : 0;
    
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Sumário das conquistas
          _buildSummaryCard(
            totalAchievements,
            completedAchievements,
            completionPercentage,
          ),
          
          SizedBox(height: 24),
          
          // Lista de conquistas por categoria
          ...nonEmptyGroups.map((group) => _buildAchievementGroup(group)),
        ],
      ),
    );
  }
  
  Widget _buildSummaryCard(int total, int completed, int percentage) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Resumo de Conquistas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem(
                  Icons.emoji_events,
                  '$completed/$total',
                  'Completadas',
                ),
                _buildStatItem(
                  Icons.percent,
                  '$percentage%',
                  'Progresso',
                ),
                _buildStatItem(
                  Icons.star,
                  _getAchievementRank(percentage),
                  'Categoria',
                ),
              ],
            ),
            SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: percentage / 100,
                backgroundColor: Colors.grey[200],
                minHeight: 10,
                valueColor: AlwaysStoppedAnimation<Color>(
                  _getColorForPercentage(percentage),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue, size: 24),
        SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
          ),
        ),
      ],
    );
  }
  
  Color _getColorForPercentage(int percentage) {
    if (percentage >= 90) return Colors.green[700]!;
    if (percentage >= 70) return Colors.green;
    if (percentage >= 50) return Colors.amber;
    if (percentage >= 30) return Colors.orange;
    return Colors.red;
  }
  
  String _getAchievementRank(int percentage) {
    if (percentage >= 90) return 'Mestre';
    if (percentage >= 70) return 'Experiente';
    if (percentage >= 50) return 'Intermediário';
    if (percentage >= 30) return 'Iniciante';
    return 'Novato';
  }
  
  Widget _buildAchievementGroup(AchievementGroup group) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Título do grupo
        Row(
          children: [
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: group.type.color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(group.type.icon, color: group.type.color),
            ),
            SizedBox(width: 12),
            Text(
              group.type.name,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(width: 8),
            Text(
              '${group.completedCount}/${group.achievements.length}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
            Spacer(),
            Text(
              '${group.totalProgress.round()}%',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: group.totalProgress > 50 ? Colors.green : Colors.grey[700],
              ),
            ),
          ],
        ),
        
        SizedBox(height: 8),
        
        // Lista de conquistas
        ...group.achievements.map((achievement) => 
          _buildAchievementCard(achievement)
        ),
        
        SizedBox(height: 24),
      ],
    );
  }
  
  Widget _buildAchievementCard(AchievementWithProgress achievement) {
    // Verificar nível do usuário para determinar se está bloqueado
    final provider = Provider.of<GamificationProvider>(context);
    final userLevel = provider.currentLevel;
    final userLevelValue = userLevel.index;
    final isLocked = achievement.isLocked(userLevelValue);
    
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 12, left: 8, right: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: achievement.completed
              ? Colors.green
              : isLocked
                  ? Colors.grey[400]!
                  : Colors.transparent,
          width: achievement.completed ? 1 : 0.5,
        ),
      ),
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isLocked
                        ? Colors.grey[300]
                        : achievement.type.color.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: achievement.completed
                      ? Icon(Icons.check_circle, color: Colors.green)
                      : isLocked
                          ? Icon(Icons.lock, color: Colors.grey[600])
                          : Text(
                              achievement.icon,
                              style: TextStyle(fontSize: 20),
                            ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        achievement.title,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isLocked ? Colors.grey[600] : Colors.black87,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        achievement.description,
                        style: TextStyle(
                          fontSize: 12,
                          color: isLocked ? Colors.grey[500] : Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isLocked
                            ? Colors.grey[200]
                            : Colors.green[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '+${achievement.pointsReward}',
                        style: TextStyle(
                          color: isLocked ? Colors.grey[600] : Colors.green[800],
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    if (isLocked) ...[
                      SizedBox(height: 4),
                      Text(
                        'Nível ${GamificationLevel.values[achievement.level].name}',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                    if (achievement.completed && achievement.completedAt != null) ...[
                      SizedBox(height: 4),
                      Text(
                        'Completado em ${DateFormat('dd/MM/yyyy').format(achievement.completedAt!)}',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.green[700],
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
            if (!isLocked) ...[
              SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: achievement.progress / achievement.requirement,
                        backgroundColor: Colors.grey[200],
                        minHeight: 8,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          achievement.completed
                              ? Colors.green
                              : achievement.type.color,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    '${achievement.progress}/${achievement.requirement}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: achievement.completed
                          ? Colors.green
                          : Colors.grey[700],
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
} 