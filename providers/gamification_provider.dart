import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/gamification/profile.dart';
import '../models/gamification/achievement.dart';
import '../models/gamification/points_history.dart';
import '../models/user.dart';

/// Provider para gerenciar o estado e a comunicação com o serviço de gamificação
class GamificationProvider with ChangeNotifier {
  final String _baseUrl = ApiConfig.baseUrl;
  
  // Gamification Profile
  GamificationProfile? _userProfile;
  GamificationProfile? get userProfile => _userProfile;
  bool _isLoadingProfile = false;
  bool get isLoadingProfile => _isLoadingProfile;
  
  // Achievements
  List<Achievement> _achievements = [];
  List<Achievement> get achievements => _achievements;
  bool _isLoadingAchievements = false;
  bool get isLoadingAchievements => _isLoadingAchievements;
  
  // Points History
  List<PointsHistoryEntry> _pointsHistory = [];
  List<PointsHistoryEntry> get pointsHistory => _pointsHistory;
  bool _isLoadingPointsHistory = false;
  bool get isLoadingPointsHistory => _isLoadingPointsHistory;
  
  // Weekly Ranking
  List<RankingEntry> _weeklyRanking = [];
  List<RankingEntry> get weeklyRanking => _weeklyRanking;
  bool _isLoadingRanking = false;
  bool get isLoadingRanking => _isLoadingRanking;
  
  // Role Ranking (for director view)
  Map<UserRole, List<RankingEntry>> _roleRanking = {
    UserRole.manager: [],
    UserRole.broker: [],
  };
  bool _hasRoleRanking = false;
  bool get hasRoleRanking => _hasRoleRanking;
  
  UserRole _currentRoleFilter = UserRole.manager;
  UserRole get currentRoleFilter => _currentRoleFilter;
  
  List<RankingEntry> get currentRoleRanking => 
      _roleRanking[_currentRoleFilter] ?? [];
  
  void setRoleFilter(UserRole role) {
    _currentRoleFilter = role;
    notifyListeners();
  }
  
  // Load user's gamification profile
  Future<void> loadUserProfile() async {
    if (_isLoadingProfile) return;
    
    _isLoadingProfile = true;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/gamification/profile'),
        headers: await _getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _userProfile = GamificationProfile.fromJson(data);
      } else {
        throw Exception('Failed to load user profile');
      }
    } catch (e) {
      print('Error loading user profile: $e');
      rethrow;
    } finally {
      _isLoadingProfile = false;
      notifyListeners();
    }
  }
  
  // Load user's achievements
  Future<void> loadAchievements() async {
    if (_isLoadingAchievements) return;
    
    _isLoadingAchievements = true;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/gamification/achievements'),
        headers: await _getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _achievements = data.map((item) => Achievement.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load achievements');
      }
    } catch (e) {
      print('Error loading achievements: $e');
      rethrow;
    } finally {
      _isLoadingAchievements = false;
      notifyListeners();
    }
  }
  
  // Load user's points history
  Future<void> loadPointsHistory() async {
    if (_isLoadingPointsHistory) return;
    
    _isLoadingPointsHistory = true;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/gamification/points-history'),
        headers: await _getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _pointsHistory = data.map((item) => PointsHistoryEntry.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load points history');
      }
    } catch (e) {
      print('Error loading points history: $e');
      rethrow;
    } finally {
      _isLoadingPointsHistory = false;
      notifyListeners();
    }
  }
  
  // Load weekly ranking
  Future<void> loadWeeklyRanking() async {
    if (_isLoadingRanking) return;
    
    _isLoadingRanking = true;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/gamification/weekly-ranking'),
        headers: await _getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _weeklyRanking = data.map((item) => RankingEntry.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load weekly ranking');
      }
    } catch (e) {
      print('Error loading weekly ranking: $e');
      rethrow;
    } finally {
      _isLoadingRanking = false;
      notifyListeners();
    }
  }
  
  // Load role ranking (for director view)
  Future<void> loadRoleRanking() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/gamification/role-ranking'),
        headers: await _getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Parse managers ranking
        if (data['managers'] != null) {
          final List<dynamic> managersData = data['managers'];
          _roleRanking[UserRole.manager] = 
              managersData.map((item) => RankingEntry.fromJson(item)).toList();
        }
        
        // Parse brokers ranking
        if (data['brokers'] != null) {
          final List<dynamic> brokersData = data['brokers'];
          _roleRanking[UserRole.broker] = 
              brokersData.map((item) => RankingEntry.fromJson(item)).toList();
        }
        
        _hasRoleRanking = true;
      } else {
        throw Exception('Failed to load role ranking');
      }
    } catch (e) {
      print('Error loading role ranking: $e');
      _hasRoleRanking = false;
      rethrow;
    } finally {
      notifyListeners();
    }
  }
  
  // Test endpoint to add points to user
  Future<void> addTestPoints(int points, String reason) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/gamification/test/add-points'),
        headers: await _getAuthHeaders(),
        body: json.encode({
          'points': points,
          'reason': reason,
        }),
      );
      
      if (response.statusCode == 200) {
        // Reload user profile to reflect updated points
        await loadUserProfile();
        await loadPointsHistory();
      } else {
        throw Exception('Failed to add test points');
      }
    } catch (e) {
      print('Error adding test points: $e');
      rethrow;
    }
  }
  
  // Get achievement stats for summary
  AchievementStats getAchievementStats() {
    if (_achievements.isEmpty) {
      return AchievementStats(total: 0, completed: 0, inProgress: 0);
    }
    
    final int total = _achievements.length;
    final int completed = _achievements.where((a) => a.completed).length;
    final int inProgress = _achievements.where((a) => !a.completed && a.progress > 0).length;
    
    return AchievementStats(
      total: total,
      completed: completed,
      inProgress: inProgress,
    );
  }
  
  // Get achievement groups
  Map<String, List<Achievement>> getAchievementGroups() {
    final Map<String, List<Achievement>> groups = {};
    
    for (final achievement in _achievements) {
      if (!groups.containsKey(achievement.category)) {
        groups[achievement.category] = [];
      }
      groups[achievement.category]!.add(achievement);
    }
    
    return groups;
  }
  
  // Helper method to get authorization headers
  Future<Map<String, String>> _getAuthHeaders() async {
    // Implementation depends on your authentication system
    // This is a placeholder - replace with actual authentication logic
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN',
    };
  }
}

class AchievementStats {
  final int total;
  final int completed;
  final int inProgress;
  
  AchievementStats({
    required this.total,
    required this.completed,
    required this.inProgress,
  });
} 