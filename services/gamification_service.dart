import 'package:dio/dio.dart';
import 'dart:convert';
import '../models/gamification/profile.dart';
import '../models/gamification/achievement.dart';
import '../models/gamification/points_history.dart';
import '../config/constants.dart';

/// Serviço responsável por gerenciar a comunicação com a API
/// relacionada ao sistema de gamificação
class GamificationService {
  final Dio _dio;
  
  GamificationService({Dio? dio}) : _dio = dio ?? Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  /// Método para obter o perfil de gamificação do usuário
  Future<GamificationProfileResponse> getProfile() async {
    try {
      final response = await _dio.get('/api/gamification/profile',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );

      if (response.statusCode == 200) {
        return GamificationProfileResponse.fromJson(response.data);
      } else {
        throw Exception('Falha ao carregar perfil de gamificação');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }

  /// Método para obter o histórico de pontos do usuário
  Future<List<PointsHistoryEntry>> getPointsHistory() async {
    try {
      final response = await _dio.get('/api/gamification/points-history',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> pointsData = response.data;
        return pointsData.map((data) => PointsHistoryEntry.fromJson(data)).toList();
      } else {
        throw Exception('Falha ao carregar histórico de pontos');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para obter as conquistas do usuário
  Future<List<AchievementWithProgress>> getAchievements() async {
    try {
      final response = await _dio.get('/api/gamification/achievements',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> achievementsData = response.data;
        return achievementsData.map((data) => AchievementWithProgress.fromJson(data)).toList();
      } else {
        throw Exception('Falha ao carregar conquistas');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para obter o ranking semanal
  Future<List<RankingEntry>> getWeeklyRanking() async {
    try {
      final response = await _dio.get('/api/gamification/weekly-ranking',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> rankingData = response.data;
        return rankingData.map((data) => RankingEntry.fromJson(data)).toList();
      } else {
        throw Exception('Falha ao carregar ranking semanal');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para diretores obterem o resumo da empresa
  Future<CompanySummary> getCompanySummary() async {
    try {
      final response = await _dio.get('/api/gamification/company-summary',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode == 200) {
        return CompanySummary.fromJson(response.data);
      } else {
        throw Exception('Falha ao carregar resumo da empresa');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para diretores e gerentes obterem o ranking por tipo de usuário
  Future<List<UserRankingEntry>> getRoleRanking(String role) async {
    try {
      final response = await _dio.get('/api/gamification/role-ranking',
        queryParameters: {'role': role},
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> rankingData = response.data;
        return rankingData.map((data) => UserRankingEntry.fromJson(data)).toList();
      } else {
        throw Exception('Falha ao carregar ranking por função');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para visualizar resumo de equipe
  Future<TeamSummary> getTeamSummary(int teamId) async {
    try {
      final response = await _dio.get('/api/gamification/team-summary/$teamId',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode == 200) {
        return TeamSummary.fromJson(response.data);
      } else {
        throw Exception('Falha ao carregar resumo da equipe');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para diretores visualizarem estatísticas por categorias de corretores
  Future<BrokerCategories> getBrokerCategories() async {
    try {
      final response = await _dio.get('/api/gamification/broker-categories',
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode == 200) {
        return BrokerCategories.fromJson(response.data);
      } else {
        throw Exception('Falha ao carregar categorias de corretores');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método para adicionar pontos (apenas para testes)
  Future<void> addTestPoints({required int points, required String reason}) async {
    try {
      final response = await _dio.post('/api/gamification/test/add-points',
        data: jsonEncode({
          'points': points,
          'reason': reason,
        }),
        options: Options(
          headers: await _getAuthHeaders(),
        ),
      );
      
      if (response.statusCode != 200) {
        throw Exception('Falha ao adicionar pontos');
      }
    } catch (e) {
      throw Exception('Erro de conexão: ${e.toString()}');
    }
  }
  
  /// Método privado para obter headers de autenticação
  Future<Map<String, String>> _getAuthHeaders() async {
    // Em uma implementação real, esse método obteria o token JWT do storage local
    // Para este exemplo, vamos retornar um header vazio que será completado pelo interceptor
    return {
      'Authorization': 'Bearer ', // Será preenchido pelo interceptor de autenticação
    };
  }
} 