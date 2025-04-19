import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/gamification_provider.dart';
import '../../models/gamification/profile.dart';
import '../../models/gamification/points_history.dart';

class GamificationProfileScreen extends StatefulWidget {
  @override
  _GamificationProfileScreenState createState() => _GamificationProfileScreenState();
}

class _GamificationProfileScreenState extends State<GamificationProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final gamificationProvider = Provider.of<GamificationProvider>(context, listen: false);
      await gamificationProvider.loadProfile();
      await gamificationProvider.loadPointsHistory();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar dados: ${e.toString()}')),
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
        title: Text('Meu Perfil de Gamificação'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Resumo'),
            Tab(text: 'Histórico'),
          ],
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildSummaryTab(),
                  _buildHistoryTab(),
                ],
              ),
            ),
    );
  }
  
  Widget _buildSummaryTab() {
    final gamificationProvider = Provider.of<GamificationProvider>(context);
    final profileResponse = gamificationProvider.profileResponse;
    
    if (profileResponse == null) {
      return Center(
        child: Text('Dados de perfil não disponíveis'),
      );
    }
    
    final profile = profileResponse.profile;
    final levelProgress = profileResponse.levelProgress;
    
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cartão de nível
          _buildLevelCard(profile, levelProgress),
          
          SizedBox(height: 24),
          
          // Estatísticas gerais
          _buildStatsCard(profile),
          
          SizedBox(height: 24),
          
          // Próximos objetivos
          _buildNextObjectivesCard(profile, levelProgress),
        ],
      ),
    );
  }
  
  Widget _buildLevelCard(GamificationProfile profile, LevelProgress levelProgress) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Título e nível
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: profile.level.color.withOpacity(0.2),
                  radius: 24,
                  child: Icon(
                    Icons.star,
                    color: profile.level.color,
                    size: 28,
                  ),
                ),
                SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Nível ${profile.level.name}',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: profile.level.color,
                      ),
                    ),
                    Text(
                      '${profile.totalPoints} pontos acumulados',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            SizedBox(height: 24),
            
            // Progresso para o próximo nível
            if (levelProgress.nextLevel != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Progresso para ${levelProgress.nextLevel!.name}:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text('${levelProgress.progress}%'),
                ],
              ),
              SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: levelProgress.progress / 100,
                  backgroundColor: Colors.grey[200],
                  minHeight: 10,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    levelProgress.nextLevel!.color,
                  ),
                ),
              ),
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Atual: ${levelProgress.currentPoints}',
                    style: TextStyle(fontSize: 12),
                  ),
                  Text(
                    'Próximo: +${levelProgress.pointsForNextLevel}',
                    style: TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ] else ...[
              Center(
                child: Text(
                  'Parabéns! Você atingiu o nível máximo!',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatsCard(GamificationProfile profile) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Estatísticas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  Icons.star,
                  '${profile.totalPoints}',
                  'Pontos Totais',
                ),
                _buildStatItem(
                  Icons.trending_up,
                  '${profile.weeklyPoints}',
                  'Pontos Semanais',
                ),
                _buildStatItem(
                  Icons.emoji_events,
                  '${profile.achievements.where((a) => a.completed).length}',
                  'Conquistas',
                ),
              ],
            ),
            Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  Icons.loop,
                  '${profile.streak}',
                  'Dias Consecutivos',
                ),
                _buildStatItem(
                  Icons.date_range,
                  profile.lastActive != null
                      ? DateFormat('dd/MM/yyyy').format(profile.lastActive!)
                      : '-',
                  'Último Acesso',
                ),
              ],
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
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
  
  Widget _buildNextObjectivesCard(GamificationProfile profile, LevelProgress levelProgress) {
    final gamificationProvider = Provider.of<GamificationProvider>(context);
    final achievements = gamificationProvider.achievements;
    
    // Filtrar conquistas não completadas e ordenar por progresso
    final nextAchievements = achievements
        .where((a) => !a.completed)
        .toList()
      ..sort((a, b) => b.progressPercentage.compareTo(a.progressPercentage));
    
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Próximos Objetivos',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            if (nextAchievements.isEmpty)
              Center(
                child: Text(
                  'Parabéns! Você completou todas as conquistas!',
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Colors.grey[600],
                  ),
                ),
              )
            else
              ...nextAchievements.take(3).map((achievement) => Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: achievement.type.color.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            achievement.type.icon,
                            color: achievement.type.color,
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
                                ),
                              ),
                              Text(
                                achievement.description,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '+${achievement.pointsReward}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
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
                                achievement.type.color,
                              ),
                            ),
                          ),
                        ),
                        SizedBox(width: 8),
                        Text(
                          '${achievement.progress}/${achievement.requirement}',
                          style: TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              )).toList(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildHistoryTab() {
    final gamificationProvider = Provider.of<GamificationProvider>(context);
    final history = gamificationProvider.pointsHistory;
    
    if (history.isEmpty) {
      return Center(
        child: Text('Nenhum histórico de pontos disponível'),
      );
    }
    
    // Agrupar por dia
    final Map<String, List<PointsHistoryEntry>> groupedByDay = {};
    
    for (var entry in history) {
      final dateKey = DateFormat('yyyy-MM-dd').format(entry.createdAt);
      if (!groupedByDay.containsKey(dateKey)) {
        groupedByDay[dateKey] = [];
      }
      groupedByDay[dateKey]!.add(entry);
    }
    
    final dailyHistory = groupedByDay.entries.map((entry) {
      return DailyPointsHistory(
        date: DateTime.parse(entry.key),
        entries: entry.value,
      );
    }).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
    
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: dailyHistory.length,
      itemBuilder: (context, index) {
        final day = dailyHistory[index];
        return _buildDayHistoryCard(day);
      },
    );
  }
  
  Widget _buildDayHistoryCard(DailyPointsHistory day) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabeçalho do dia
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('dd/MM/yyyy (EEEE)', 'pt_BR').format(day.date),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: day.isPositive ? Colors.green : Colors.red,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    day.formattedTotal,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Entradas do dia
          ListView.separated(
            physics: NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: day.entries.length,
            separatorBuilder: (context, index) => Divider(height: 1),
            itemBuilder: (context, index) {
              final entry = day.entries[index];
              return ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: entry.isPositive 
                        ? Colors.green.withOpacity(0.1) 
                        : Colors.red.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    entry.getIconEmoji(),
                    style: TextStyle(fontSize: 20),
                  ),
                ),
                title: Text(entry.reason),
                subtitle: Text(
                  DateFormat('HH:mm').format(entry.createdAt),
                  style: TextStyle(fontSize: 12),
                ),
                trailing: Text(
                  entry.isPositive ? '+${entry.points}' : '${entry.points}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: entry.isPositive ? Colors.green : Colors.red,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
} 