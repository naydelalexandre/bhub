import 'package:flutter/material.dart';

/// Enum para os tipos de conquistas
enum AchievementType {
  activity,
  deal,
  communication,
  streak,
  ranking
}

/// Extensão para converter string para AchievementType
extension AchievementTypeExtension on AchievementType {
  String get name {
    switch (this) {
      case AchievementType.activity: return 'Atividade';
      case AchievementType.deal: return 'Negociação';
      case AchievementType.communication: return 'Comunicação';
      case AchievementType.streak: return 'Sequência';
      case AchievementType.ranking: return 'Ranking';
    }
  }
  
  IconData get icon {
    switch (this) {
      case AchievementType.activity: return Icons.task_alt;
      case AchievementType.deal: return Icons.handshake;
      case AchievementType.communication: return Icons.chat;
      case AchievementType.streak: return Icons.loop;
      case AchievementType.ranking: return Icons.emoji_events;
    }
  }
  
  Color get color {
    switch (this) {
      case AchievementType.activity: return Colors.green;
      case AchievementType.deal: return Colors.blue;
      case AchievementType.communication: return Colors.purple;
      case AchievementType.streak: return Colors.orange;
      case AchievementType.ranking: return Colors.amber;
    }
  }
  
  static AchievementType fromString(String type) {
    switch (type.toLowerCase()) {
      case 'activity': return AchievementType.activity;
      case 'deal': return AchievementType.deal;
      case 'communication': return AchievementType.communication;
      case 'streak': return AchievementType.streak;
      case 'ranking': return AchievementType.ranking;
      default: return AchievementType.activity;
    }
  }
}

/// Modelo para uma conquista
class Achievement {
  final int id;
  final String title;
  final String description;
  final AchievementType type;
  final String icon;
  final int pointsReward;
  final int requirement;
  final int level;
  final DateTime createdAt;
  
  Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.icon,
    required this.pointsReward,
    required this.requirement,
    required this.level,
    required this.createdAt,
  });
  
  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: AchievementTypeExtension.fromString(json['type']),
      icon: json['icon'],
      pointsReward: json['pointsReward'],
      requirement: json['requirement'],
      level: json['level'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

/// Modelo para uma conquista com progresso do usuário
class AchievementWithProgress extends Achievement {
  final int progress;
  final bool completed;
  final DateTime? completedAt;
  
  AchievementWithProgress({
    required int id,
    required String title,
    required String description,
    required AchievementType type,
    required String icon,
    required int pointsReward,
    required int requirement,
    required int level,
    required DateTime createdAt,
    required this.progress,
    required this.completed,
    this.completedAt,
  }) : super(
    id: id,
    title: title,
    description: description,
    type: type,
    icon: icon,
    pointsReward: pointsReward,
    requirement: requirement,
    level: level,
    createdAt: createdAt,
  );
  
  factory AchievementWithProgress.fromJson(Map<String, dynamic> json) {
    return AchievementWithProgress(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: AchievementTypeExtension.fromString(json['type']),
      icon: json['icon'],
      pointsReward: json['pointsReward'],
      requirement: json['requirement'],
      level: json['level'],
      createdAt: DateTime.parse(json['createdAt']),
      progress: json['progress'],
      completed: json['completed'],
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
    );
  }
  
  /// Calcula o percentual de progresso da conquista
  double get progressPercentage => 
      requirement > 0 ? (progress / requirement) * 100 : 0;
  
  /// Verifica se a conquista está bloqueada com base no nível
  bool isLocked(int userLevel) => level > userLevel;
}

/// Modelo agrupado de conquistas por tipo
class AchievementGroup {
  final AchievementType type;
  final List<AchievementWithProgress> achievements;
  
  AchievementGroup({
    required this.type,
    required this.achievements,
  });
  
  /// Calcula o número de conquistas completadas no grupo
  int get completedCount => 
      achievements.where((a) => a.completed).length;
      
  /// Calcula o progresso total do grupo (porcentagem de conclusão)
  double get totalProgress => 
      achievements.isNotEmpty
          ? (completedCount / achievements.length) * 100
          : 0;
} 