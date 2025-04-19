import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

// Arquivo principal (main.dart)
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ActivityProvider()),
        ChangeNotifierProvider(create: (_) => DealProvider()),
        ChangeNotifierProvider(create: (_) => MessageProvider()),
        ChangeNotifierProvider(create: (_) => GamificationProvider()),
      ],
      child: BrokerBoosterApp(),
    ),
  );
}

// Classe principal do aplicativo
class BrokerBoosterApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    
    return MaterialApp(
      title: 'BrokerBooster',
      theme: ThemeData(
        primaryColor: Color(0xFF2196F3),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Color(0xFF2196F3),
          primary: Color(0xFF2196F3),
          secondary: Color(0xFFFF9800),
        ),
        useMaterial3: true,
        fontFamily: 'Poppins',
      ),
      darkTheme: ThemeData.dark().copyWith(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Color(0xFF2196F3),
          primary: Color(0xFF2196F3),
          secondary: Color(0xFFFF9800),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: ThemeMode.system,
      home: authProvider.isAuthenticated 
          ? _getRoleBasedDashboard(authProvider.user.role)
          : LoginScreen(),
      routes: {
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
        '/profile': (context) => ProfileScreen(),
        '/activities': (context) => ActivitiesListScreen(),
        '/deals': (context) => DealsListScreen(),
        '/messages': (context) => ChatListScreen(),
        '/team': (context) => TeamDetailsScreen(),
        '/gamification/profile': (context) => GamificationProfileScreen(),
        '/gamification/achievements': (context) => AchievementsScreen(),
        '/gamification/ranking': (context) => RankingScreen(),
      },
    );
  }
  
  Widget _getRoleBasedDashboard(String role) {
    switch (role) {
      case 'director':
        return DirectorDashboardScreen();
      case 'manager':
        return ManagerDashboardScreen();
      case 'broker':
      default:
        return BrokerDashboardScreen();
    }
  }
}

// Exemplo de tela principal para corretor
class BrokerDashboardScreen extends StatefulWidget {
  @override
  _BrokerDashboardScreenState createState() => _BrokerDashboardScreenState();
}

class _BrokerDashboardScreenState extends State<BrokerDashboardScreen> {
  int _selectedIndex = 0;
  
  final List<Widget> _screens = [
    HomeTab(),
    ActivitiesTab(),
    DealsTab(),
    ChatTab(),
    GamificationTab(),
  ];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('BrokerBooster'),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications),
            onPressed: () {
              Navigator.pushNamed(context, '/notifications');
            },
          ),
          IconButton(
            icon: Icon(Icons.person),
            onPressed: () {
              Navigator.pushNamed(context, '/profile');
            },
          ),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.task),
            label: 'Atividades',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Negociações',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'Chat',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events),
            label: 'Gamificação',
          ),
        ],
      ),
    );
  }
}

// Tab da Home
class HomeTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cartão de boas-vindas
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: Theme.of(context).primaryColor,
                          radius: 24,
                          child: Text('JS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Bem-vindo, João Silva', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                            Text('Corretor • Nível Gold', style: TextStyle(color: Colors.grey[600])),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStat('Atividades', '7', Icons.assignment),
                        _buildStat('Negociações', '3', Icons.trending_up),
                        _buildStat('Ranking', '#3', Icons.emoji_events),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: 24),
            
            // Atividades recentes
            Text('Atividades Recentes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListView.separated(
                physics: NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                itemCount: 3,
                separatorBuilder: (context, index) => Divider(height: 1),
                itemBuilder: (context, index) {
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getActivityColor(index),
                      child: Icon(_getActivityIcon(index), color: Colors.white),
                    ),
                    title: Text(_getActivityTitle(index)),
                    subtitle: Text(_getActivityDate(index)),
                    trailing: Icon(Icons.chevron_right),
                    onTap: () {
                      // Navegar para detalhes da atividade
                    },
                  );
                },
              ),
            ),
            
            SizedBox(height: 24),
            
            // Progresso da gamificação
            Text('Seu Progresso', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Nível Gold', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('65% para Platinum', style: TextStyle(color: Colors.grey[600])),
                      ],
                    ),
                    SizedBox(height: 12),
                    LinearProgressIndicator(
                      value: 0.65,
                      backgroundColor: Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).colorScheme.secondary),
                      minHeight: 8,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('1,250 pts'),
                        Text('2,000 pts para o próximo nível'),
                      ],
                    ),
                    SizedBox(height: 16),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/gamification/profile');
                      },
                      child: Text('Ver Perfil Completo'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: Size(double.infinity, 40),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: 24),
            
            // Mensagens recentes
            Text('Mensagens Recentes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListView.separated(
                physics: NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                itemCount: 3,
                separatorBuilder: (context, index) => Divider(height: 1),
                itemBuilder: (context, index) {
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundImage: _getChatAvatar(index),
                      radius: 20,
                    ),
                    title: Text(_getChatName(index)),
                    subtitle: Text(_getChatLastMessage(index), maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(_getChatTime(index), style: TextStyle(fontSize: 12)),
                        SizedBox(height: 4),
                        if (index == 0)
                          Container(
                            padding: EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                            child: Text('2', style: TextStyle(color: Colors.white, fontSize: 10)),
                          ),
                      ],
                    ),
                    onTap: () {
                      // Navegar para chat
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStat(String title, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue),
        SizedBox(height: 4),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      ],
    );
  }
  
  Color _getActivityColor(int index) {
    switch (index) {
      case 0: return Colors.orange;
      case 1: return Colors.green;
      case 2: return Colors.blue;
      default: return Colors.grey;
    }
  }
  
  IconData _getActivityIcon(int index) {
    switch (index) {
      case 0: return Icons.call;
      case 1: return Icons.house;
      case 2: return Icons.description;
      default: return Icons.assignment;
    }
  }
  
  String _getActivityTitle(int index) {
    switch (index) {
      case 0: return 'Contato com Sr. Carlos';
      case 1: return 'Visita ao imóvel da Av. Paulista';
      case 2: return 'Preparar proposta para Dra. Ana';
      default: return 'Atividade';
    }
  }
  
  String _getActivityDate(int index) {
    switch (index) {
      case 0: return 'Hoje, 15:30';
      case 1: return 'Amanhã, 10:00';
      case 2: return '22/04, 14:00';
      default: return '';
    }
  }
  
  ImageProvider? _getChatAvatar(int index) {
    return null; // Em um app real, retornaria a imagem do avatar
  }
  
  String _getChatName(int index) {
    switch (index) {
      case 0: return 'Ricardo (Gerente)';
      case 1: return 'Equipe Alpha';
      case 2: return 'Maria Silva';
      default: return '';
    }
  }
  
  String _getChatLastMessage(int index) {
    switch (index) {
      case 0: return 'Precisamos discutir sobre o cliente da Av. Paulista';
      case 1: return 'João: Alguém tem o contato da Imobiliária Central?';
      case 2: return 'Obrigada pela ajuda com a documentação!';
      default: return '';
    }
  }
  
  String _getChatTime(int index) {
    switch (index) {
      case 0: return '10:42';
      case 1: return 'Ontem';
      case 2: return '18/04';
      default: return '';
    }
  }
}

// Placeholder para outras telas - em um app real seriam implementadas completamente
class ActivitiesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(child: Text('Atividades'));
}

class DealsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(child: Text('Negociações'));
}

class ChatTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(child: Text('Chat'));
}

class GamificationTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(child: Text('Gamificação'));
}

// Providers (apenas estrutura, não implementados)
class AuthProvider extends ChangeNotifier {
  bool get isAuthenticated => true;
  
  UserModel get user => UserModel(
    id: 1,
    name: 'João Silva',
    username: 'joao.silva@brokerbooster.com',
    role: 'broker',
    avatarInitials: 'JS',
  );
}

class ActivityProvider extends ChangeNotifier {}
class DealProvider extends ChangeNotifier {}
class MessageProvider extends ChangeNotifier {}
class GamificationProvider extends ChangeNotifier {}

// Modelo de usuário
class UserModel {
  final int id;
  final String name;
  final String username;
  final String role;
  final String avatarInitials;
  
  UserModel({
    required this.id,
    required this.name,
    required this.username,
    required this.role,
    required this.avatarInitials,
  });
}

// Telas de autenticação e outras (stubs)
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Login')));
}

class RegisterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Registro')));
}

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Perfil')));
}

class ActivitiesListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Lista de Atividades')));
}

class DealsListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Lista de Negociações')));
}

class ChatListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Lista de Chats')));
}

class TeamDetailsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Detalhes da Equipe')));
}

class GamificationProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Perfil de Gamificação')));
}

class AchievementsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Conquistas')));
}

class RankingScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Ranking')));
}

class DirectorDashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Dashboard do Diretor')));
}

class ManagerDashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text('Dashboard do Gerente')));
} 