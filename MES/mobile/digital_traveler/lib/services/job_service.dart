import 'package:dio/dio.dart';

class JobService {
  final Dio _dio = Dio(BaseOptions(
    // Android Emulator: 10.0.2.2
    // iOS Simulator: 127.0.0.1
    // Real Device: Use Host IP
    baseUrl: 'http://10.0.2.2:8000/api', 
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 3),
  ));

  Future<Map<String, dynamic>> getActiveJob(String machineId) async {
    try {
      final response = await _dio.get('/shop-floor/operator/$machineId/active-job');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch job: $e');
    }
  }

  Future<void> updateJobStatus(String jobId, String status) async {
    try {
      await _dio.post('/shop-floor/jobs/$jobId/status', data: {'status': status});
    } catch (e) {
      throw Exception('Failed to update status: $e');
    }
  }

  // Engineer Agent: Post-Processing Step Tracking
  Future<void> updateJobStep(String jobId, String step) async {
    try {
      await _dio.post('/shop-floor/jobs/$jobId/step', data: {'step': step});
    } catch (e) {
      throw Exception('Failed to update step: $e');
    }
  }
}
