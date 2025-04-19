/// Modelo para um registro de histórico de pontos
class PointsHistoryEntry {
  final int id;
  final int userId;
  final int points;
  final String reason;
  final int? relatedId;
  final String? relatedType;
  final DateTime createdAt;
  
  PointsHistoryEntry({
    required this.id,
    required this.userId,
    required this.points,
    required this.reason,
    this.relatedId,
    this.relatedType,
    required this.createdAt,
  });
  
  factory PointsHistoryEntry.fromJson(Map<String, dynamic> json) {
    return PointsHistoryEntry(
      id: json['id'],
      userId: json['userId'],
      points: json['points'],
      reason: json['reason'],
      relatedId: json['relatedId'],
      relatedType: json['relatedType'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
  
  /// Verifica se a entrada é positiva (ganho de pontos)
  bool get isPositive => points > 0;
  
  /// Retorna o ícone relacionado ao tipo de entrada
  String getIconEmoji() {
    if (relatedType == 'activity') return '✅';
    if (relatedType == 'deal') return '🤝';
    if (relatedType == 'achievement') return '🏆';
    if (relatedType == 'communication') return '💬';
    return isPositive ? '⬆️' : '⬇️';
  }
}

/// Modelo para agrupar entradas de histórico por dia
class DailyPointsHistory {
  final DateTime date;
  final List<PointsHistoryEntry> entries;
  
  DailyPointsHistory({
    required this.date,
    required this.entries,
  });
  
  /// Calcula o total de pontos do dia
  int get totalPoints => 
      entries.fold(0, (sum, entry) => sum + entry.points);
  
  /// Verifica se o total de pontos do dia é positivo
  bool get isPositive => totalPoints > 0;
  
  /// Formata o total de pontos com sinal
  String get formattedTotal => 
      isPositive ? '+$totalPoints' : '$totalPoints';
} 