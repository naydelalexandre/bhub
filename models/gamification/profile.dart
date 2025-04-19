import 'package:flutter/material.dart';

/// Enum para os níveis de gamificação
enum GamificationLevel {
  bronze,
  silver,
  gold,
  platinum,
  diamond
}

/// Extensão para converter string para GamificationLevel
extension GamificationLevelExtension on GamificationLevel {
  String get name {
    switch (this) {
      case GamificationLevel.bronze: return 'Bronze';
      case GamificationLevel.silver: return 'Prata';
      case GamificationLevel.gold: return 'Ouro';
      case GamificationLevel.platinum: return 'Platina';
      case GamificationLevel.diamond: return 'Diamante';
    }
  }
  
  Color get color {
    switch (this) {
      case GamificationLevel.bronze: return Color(0xFFCD7F32);
      case GamificationLevel.silver: return Color(0xFFC0C0C0);
      case GamificationLevel.gold: return Color(0xFFFFD700);
      case GamificationLevel.platinum: return Color(0xFFE5E4E2);
      case GamificationLevel.diamond: return Color(0xFFB9F2FF);
    }
  }
  
  static GamificationLevel fromString(String level) {
    switch (level.toLowerCase()) {
      case 'bronze': return GamificationLevel.bronze;
      case 'silver': return GamificationLevel.silver;
      case 'gold': return GamificationLevel.gold;
      case 'platinum': return GamificationLevel.platinum;
      case 'diamond': return GamificationLevel.diamond;
      default: return GamificationLevel.bronze;
    }
  }
}

/// Modelo para Conquista do Usuário
class UserAchievement {
  final int achievementId;
  final int progress;
  final bool completed;
  final DateTime? completedAt;
  
  UserAchievement({
    required this.achievementId,
    required this.progress,
    required this.completed,
    this.completedAt,
  });
  
  factory UserAchievement.fromJson(Map<String, dynamic> json) {
    return UserAchievement(
      achievementId: json['achievementId'],
      progress: json['progress'],
      completed: json['completed'],
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'achievementId': achievementId,
      'progress': progress,
      'completed': completed,
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

/// Modelo para o Perfil de Gamificação do usuário
class GamificationProfile {
  final int id;
  final int userId;
  final GamificationLevel level;
  final int totalPoints;
  final int weeklyPoints;
  final int streak;
  final DateTime? lastActive;
  final List<UserAchievement> achievements;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  GamificationProfile({
    required this.id,
    required this.userId,
    required this.level,
    required this.totalPoints,
    required this.weeklyPoints,
    required this.streak,
    this.lastActive,
    required this.achievements,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory GamificationProfile.fromJson(Map<String, dynamic> json) {
    return GamificationProfile(
      id: json['id'],
      userId: json['userId'],
      level: GamificationLevelExtension.fromString(json['level']),
      totalPoints: json['totalPoints'],
      weeklyPoints: json['weeklyPoints'],
      streak: json['streak'],
      lastActive: json['lastActive'] != null 
          ? DateTime.parse(json['lastActive']) 
          : null,
      achievements: (json['achievements'] as List)
          .map((achievement) => UserAchievement.fromJson(achievement))
          .toList(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

/// Modelo para o Progresso de Nível
class LevelProgress {
  final GamificationLevel level;
  final GamificationLevel? nextLevel;
  final int currentPoints;
  final int pointsForNextLevel;
  final int progress;
  
  LevelProgress({
    required this.level,
    this.nextLevel,
    required this.currentPoints,
    required this.pointsForNextLevel,
    required this.progress,
  });
  
  factory LevelProgress.fromJson(Map<String, dynamic> json) {
    return LevelProgress(
      level: GamificationLevelExtension.fromString(json['level']),
      nextLevel: json['nextLevel'] != null 
          ? GamificationLevelExtension.fromString(json['nextLevel']) 
          : null,
      currentPoints: json['currentPoints'],
      pointsForNextLevel: json['pointsForNextLevel'],
      progress: json['progress'],
    );
  }
}

/// Modelo para a resposta da API com o perfil e progresso
class GamificationProfileResponse {
  final GamificationProfile profile;
  final LevelProgress levelProgress;
  
  GamificationProfileResponse({
    required this.profile,
    required this.levelProgress,
  });
  
  factory GamificationProfileResponse.fromJson(Map<String, dynamic> json) {
    return GamificationProfileResponse(
      profile: GamificationProfile.fromJson(json['profile']),
      levelProgress: LevelProgress.fromJson(json['levelProgress']),
    );
  }
}

/// Modelo para o item do Ranking
class RankingEntry {
  final int userId;
  final String name;
  final String role;
  final GamificationLevel level;
  final int points;
  final int activities;
  final int deals;
  
  RankingEntry({
    required this.userId,
    required this.name,
    required this.role,
    required this.level,
    required this.points,
    required this.activities,
    required this.deals,
  });
  
  factory RankingEntry.fromJson(Map<String, dynamic> json) {
    return RankingEntry(
      userId: json['userId'],
      name: json['name'],
      role: json['role'],
      level: GamificationLevelExtension.fromString(json['level']),
      points: json['points'],
      activities: json['activities'],
      deals: json['deals'],
    );
  }
}

/// Modelo para o item do Ranking específico por função
class UserRankingEntry {
  final int userId;
  final String name;
  final String avatarInitials;
  final int? teamId;
  final int totalPoints;
  final int weeklyPoints;
  final GamificationLevel level;
  final Map<String, int> achievements;
  
  UserRankingEntry({
    required this.userId,
    required this.name,
    required this.avatarInitials,
    this.teamId,
    required this.totalPoints,
    required this.weeklyPoints,
    required this.level,
    required this.achievements,
  });
  
  factory UserRankingEntry.fromJson(Map<String, dynamic> json) {
    return UserRankingEntry(
      userId: json['userId'],
      name: json['name'],
      avatarInitials: json['avatarInitials'],
      teamId: json['teamId'],
      totalPoints: json['totalPoints'],
      weeklyPoints: json['weeklyPoints'],
      level: GamificationLevelExtension.fromString(json['level']),
      achievements: {
        'total': json['achievements']['total'],
        'completed': json['achievements']['completed'],
      },
    );
  }
}

/// Modelo para o Resumo da Empresa (para diretores)
class CompanySummary {
  final int totalUsers;
  final Map<String, int> levelDistribution;
  final Map<String, dynamic> achievements;
  final Map<String, dynamic> points;
  final DateTime lastUpdated;
  
  CompanySummary({
    required this.totalUsers,
    required this.levelDistribution,
    required this.achievements,
    required this.points,
    required this.lastUpdated,
  });
  
  factory CompanySummary.fromJson(Map<String, dynamic> json) {
    return CompanySummary(
      totalUsers: json['totalUsers'],
      levelDistribution: Map<String, int>.from(json['levelDistribution']),
      achievements: json['achievements'],
      points: json['points'],
      lastUpdated: DateTime.parse(json['lastUpdated']),
    );
  }
}

/// Modelo para o Resumo da Equipe
class TeamSummary {
  final int teamId;
  final String teamName;
  final int? managerId;
  final int totalMembers;
  final Map<String, int> levelDistribution;
  final Map<String, dynamic> achievements;
  final int totalPoints;
  final int weeklyPoints;
  final List<TeamMemberSummary> members;
  
  TeamSummary({
    required this.teamId,
    required this.teamName,
    this.managerId,
    required this.totalMembers,
    required this.levelDistribution,
    required this.achievements,
    required this.totalPoints,
    required this.weeklyPoints,
    required this.members,
  });
  
  factory TeamSummary.fromJson(Map<String, dynamic> json) {
    return TeamSummary(
      teamId: json['teamId'],
      teamName: json['teamName'],
      managerId: json['managerId'],
      totalMembers: json['totalMembers'],
      levelDistribution: Map<String, int>.from(json['levelDistribution']),
      achievements: json['achievements'],
      totalPoints: json['totalPoints'],
      weeklyPoints: json['weeklyPoints'],
      members: (json['members'] as List)
          .map((member) => TeamMemberSummary.fromJson(member))
          .toList(),
    );
  }
}

/// Modelo para o resumo de um membro da equipe
class TeamMemberSummary {
  final int userId;
  final String name;
  final String avatarInitials;
  final String role;
  final int totalPoints;
  final int weeklyPoints;
  final GamificationLevel level;
  
  TeamMemberSummary({
    required this.userId,
    required this.name,
    required this.avatarInitials,
    required this.role,
    required this.totalPoints,
    required this.weeklyPoints,
    required this.level,
  });
  
  factory TeamMemberSummary.fromJson(Map<String, dynamic> json) {
    return TeamMemberSummary(
      userId: json['userId'],
      name: json['name'],
      avatarInitials: json['avatarInitials'],
      role: json['role'],
      totalPoints: json['totalPoints'],
      weeklyPoints: json['weeklyPoints'],
      level: GamificationLevelExtension.fromString(json['level']),
    );
  }
}

/// Modelo para as categorias de corretores (para diretores)
class BrokerCategories {
  final BrokerCategoryData highPerformers;
  final BrokerCategoryData growingPerformers;
  final BrokerCategoryData newBrokers;
  final int totalBrokers;
  final DateTime lastUpdated;
  
  BrokerCategories({
    required this.highPerformers,
    required this.growingPerformers,
    required this.newBrokers,
    required this.totalBrokers,
    required this.lastUpdated,
  });
  
  factory BrokerCategories.fromJson(Map<String, dynamic> json) {
    return BrokerCategories(
      highPerformers: BrokerCategoryData.fromJson(json['highPerformers']),
      growingPerformers: BrokerCategoryData.fromJson(json['growingPerformers']),
      newBrokers: BrokerCategoryData.fromJson(json['newBrokers']),
      totalBrokers: json['totalBrokers'],
      lastUpdated: DateTime.parse(json['lastUpdated']),
    );
  }
}

/// Modelo para os dados de uma categoria de corretores
class BrokerCategoryData {
  final List<BrokerSummary> brokers;
  final CategoryStats? stats;
  
  BrokerCategoryData({
    required this.brokers,
    this.stats,
  });
  
  factory BrokerCategoryData.fromJson(Map<String, dynamic> json) {
    return BrokerCategoryData(
      brokers: (json['brokers'] as List)
          .map((broker) => BrokerSummary.fromJson(broker))
          .toList(),
      stats: json['stats'] != null 
          ? CategoryStats.fromJson(json['stats']) 
          : null,
    );
  }
}

/// Modelo para as estatísticas de uma categoria
class CategoryStats {
  final int count;
  final int avgPoints;
  final int avgWeeklyPoints;
  final int avgActivities;
  final double avgDeals;
  final Map<String, int> levelDistribution;
  
  CategoryStats({
    required this.count,
    required this.avgPoints,
    required this.avgWeeklyPoints,
    required this.avgActivities,
    required this.avgDeals,
    required this.levelDistribution,
  });
  
  factory CategoryStats.fromJson(Map<String, dynamic> json) {
    return CategoryStats(
      count: json['count'],
      avgPoints: json['avgPoints'],
      avgWeeklyPoints: json['avgWeeklyPoints'],
      avgActivities: json['avgActivities'],
      avgDeals: json['avgDeals'],
      levelDistribution: Map<String, int>.from(json['levelDistribution']),
    );
  }
}

/// Modelo para o resumo de um corretor
class BrokerSummary {
  final int id;
  final String name;
  final GamificationLevel level;
  final int totalPoints;
  
  BrokerSummary({
    required this.id,
    required this.name,
    required this.level,
    required this.totalPoints,
  });
  
  factory BrokerSummary.fromJson(Map<String, dynamic> json) {
    return BrokerSummary(
      id: json['id'],
      name: json['name'],
      level: GamificationLevelExtension.fromString(json['level']),
      totalPoints: json['totalPoints'],
    );
  }
} 