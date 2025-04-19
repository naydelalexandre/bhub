import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/gamification_provider.dart';
import '../../models/gamification/profile.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';

class RankingScreen extends StatefulWidget {
  @override
  _RankingScreenState createState() => _RankingScreenState();
}

class _RankingScreenState extends State<RankingScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  late TabController _tabController;
  int _selectedTabIndex = 0;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _selectedTabIndex = _tabController.index;
      });
    });
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
      final provider = Provider.of<GamificationProvider>(context, listen: false);
      await provider.loadWeeklyRanking();
      
      // Se o usuário for diretor, carrega também o ranking por função
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.currentUser?.role == UserRole.director) {
        await provider.loadRoleRanking();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar ranking: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isDirector = authProvider.currentUser?.role == UserRole.director;
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Ranking'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Ranking Semanal'),
            if (isDirector) Tab(text: 'Por Função') else Tab(text: 'Histórico'),
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
                  _buildWeeklyRanking(),
                  isDirector ? _buildRoleRanking() : _buildHistoricRanking(),
                ],
              ),
            ),
    );
  }
  
  Widget _buildWeeklyRanking() {
    final provider = Provider.of<GamificationProvider>(context);
    final ranking = provider.weeklyRanking;
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUserId = authProvider.currentUser?.id ?? '';
    
    if (ranking.isEmpty) {
      return Center(
        child: Text('Nenhum dado de ranking disponível'),
      );
    }
    
    // Encontrar a posição do usuário atual
    final userRank = ranking.indexWhere((r) => r.userId == currentUserId);
    
    return Column(
      children: [
        // Cabeçalho com os três primeiros colocados
        if (ranking.length >= 3) _buildTopThree(ranking.take(3).toList()),
        
        // Linha de separação
        Divider(thickness: 1),
        
        // Lista completa do ranking
        Expanded(
          child: ListView.builder(
            itemCount: ranking.length,
            itemBuilder: (context, index) {
              final rank = ranking[index];
              final isCurrentUser = rank.userId == currentUserId;
              
              return Container(
                color: isCurrentUser ? Colors.blue.withOpacity(0.1) : null,
                child: ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: _getRankColor(index).withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _getRankColor(index),
                      ),
                    ),
                  ),
                  title: Text(
                    rank.userName,
                    style: TextStyle(
                      fontWeight: isCurrentUser ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  subtitle: Text(
                    _getRoleText(rank.userRole),
                    style: TextStyle(
                      fontSize: 12,
                    ),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${rank.weeklyPoints}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[700],
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(width: 4),
                      Text(
                        'pts',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        
        // Mostrar a posição do usuário se não estiver entre os primeiros 10
        if (userRank > 9) _buildCurrentUserPosition(ranking[userRank], userRank + 1),
      ],
    );
  }
  
  Widget _buildTopThree(List<RankingEntry> topThree) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Segundo lugar
          if (topThree.length > 1) _buildTopPosition(topThree[1], 2, 80),
          
          // Primeiro lugar
          _buildTopPosition(topThree[0], 1, 100),
          
          // Terceiro lugar
          if (topThree.length > 2) _buildTopPosition(topThree[2], 3, 70),
        ],
      ),
    );
  }
  
  Widget _buildTopPosition(RankingEntry entry, int position, double height) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: _getMedalColor(position),
              width: 2,
            ),
            color: Colors.white,
          ),
          child: Center(
            child: Icon(
              _getMedalIcon(position),
              color: _getMedalColor(position),
              size: 30,
            ),
          ),
        ),
        SizedBox(height: 8),
        Container(
          height: height,
          width: 80,
          decoration: BoxDecoration(
            color: _getMedalColor(position).withOpacity(0.2),
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                entry.userName.split(' ')[0],
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 4),
              Text(
                '${entry.weeklyPoints}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: _getMedalColor(position),
                  fontSize: 16,
                ),
              ),
              Text(
                'pontos',
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildCurrentUserPosition(RankingEntry entry, int position) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        border: Border(
          top: BorderSide(color: Colors.blue.withOpacity(0.3), width: 1),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Text(
              '$position',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sua posição',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                Text(
                  entry.userName,
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${entry.weeklyPoints}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blue[700],
              fontSize: 18,
            ),
          ),
          SizedBox(width: 4),
          Text(
            'pts',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildRoleRanking() {
    final provider = Provider.of<GamificationProvider>(context);
    
    if (!provider.hasRoleRanking) {
      return Center(
        child: Text('Dados de ranking por função não disponíveis'),
      );
    }
    
    return Column(
      children: [
        // Tabs para alternar entre gerentes e corretores
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: _buildRoleTabButton(
                  'Gerentes',
                  UserRole.manager,
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: _buildRoleTabButton(
                  'Corretores',
                  UserRole.broker,
                ),
              ),
            ],
          ),
        ),
        
        Divider(thickness: 1),
        
        // Lista do ranking por função
        Expanded(
          child: _buildRoleRankingList(),
        ),
      ],
    );
  }
  
  Widget _buildRoleTabButton(String label, UserRole role) {
    final provider = Provider.of<GamificationProvider>(context);
    final isSelected = provider.currentRoleFilter == role;
    
    return InkWell(
      onTap: () {
        provider.setRoleFilter(role);
      },
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildRoleRankingList() {
    final provider = Provider.of<GamificationProvider>(context);
    final ranking = provider.currentRoleRanking;
    
    if (ranking.isEmpty) {
      return Center(
        child: Text('Nenhum dado disponível para esta função'),
      );
    }
    
    return ListView.builder(
      itemCount: ranking.length,
      itemBuilder: (context, index) {
        final entry = ranking[index];
        
        return ListTile(
          leading: Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: _getRankColor(index).withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Text(
              '${index + 1}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: _getRankColor(index),
              ),
            ),
          ),
          title: Text(entry.userName),
          subtitle: Text(
            'Nível ${entry.level}',
            style: TextStyle(fontSize: 12),
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${entry.totalPoints}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[700],
                  fontSize: 16,
                ),
              ),
              Text(
                'pontos totais',
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildHistoricRanking() {
    // Implementação futura - mostrará o histórico de pontuação do usuário
    return Center(
      child: Text('Histórico de ranking em desenvolvimento'),
    );
  }
  
  Color _getRankColor(int position) {
    if (position == 0) return Colors.amber;
    if (position == 1) return Colors.blueGrey;
    if (position == 2) return Colors.brown;
    return Colors.blue;
  }
  
  Color _getMedalColor(int position) {
    if (position == 1) return Colors.amber;
    if (position == 2) return Colors.blueGrey;
    if (position == 3) return Colors.brown;
    return Colors.blue;
  }
  
  IconData _getMedalIcon(int position) {
    if (position == 1) return Icons.emoji_events;
    if (position == 2) return Icons.emoji_events;
    if (position == 3) return Icons.emoji_events;
    return Icons.emoji_events;
  }
  
  String _getRoleText(UserRole role) {
    switch (role) {
      case UserRole.director:
        return 'Diretor';
      case UserRole.manager:
        return 'Gerente';
      case UserRole.broker:
        return 'Corretor';
      default:
        return 'Usuário';
    }
  }
} 