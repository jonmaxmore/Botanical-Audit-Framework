import 'dart:io';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../core/errors/failures.dart';
import '../../core/network/dio_client.dart';
import '../../domain/entities/application_entity.dart';
import '../../domain/repositories/application_repository.dart';

class ApplicationRepositoryImpl implements ApplicationRepository {
  final DioClient _dioClient;

  ApplicationRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications() async {
    try {
      final response = await _dioClient.get('/applications/my-applications');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final apps = data.map((item) => ApplicationEntity(
          id: item['_id'] ?? item['id'],
          type: item['type'] ?? 'Unknown',
          status: item['status'] ?? 'Draft',
          establishmentId: item['establishment']?['_id'] ?? item['establishment'] ?? '',
          establishmentName: item['establishment']?['name'] ?? 'Unknown Farm',
          formData: item['data'] ?? {},
          documents: (item['documents'] as List?)?.map((d) => d.toString()).toList() ?? [],
          createdAt: DateTime.tryParse(item['createdAt']) ?? DateTime.now(),
        )).toList();
        return Right(apps);
      } else {
        return const Left(ServerFailure(message: 'Failed to fetch applications'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ApplicationEntity>> createApplication({
    required String establishmentId,
    required String type,
    required Map<String, dynamic> formData,
    required Map<String, File> documents,
  }) async {
    try {
      final map = <String, dynamic>{
        'establishmentId': establishmentId,
        'type': type,
        ...formData, // Spread form data into the body
      };

      // Handle file uploads using FormData
      final data = FormData.fromMap(map);
      
      for (var entry in documents.entries) {
        data.files.add(MapEntry(
          entry.key,
          await MultipartFile.fromFile(entry.value.path, filename: '${entry.key}.jpg'),
        ));
      }

      final response = await _dioClient.post('/applications', data: data);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final item = response.data['data'];
        return Right(ApplicationEntity(
          id: item['_id'] ?? item['id'],
          type: item['type'] ?? type,
          status: item['status'] ?? 'Pending',
          establishmentId: item['establishment']?['_id'] ?? establishmentId,
          establishmentName: item['establishment']?['name'] ?? 'Unknown',
          formData: item['data'] ?? formData,
          documents: [], // Files are uploaded, but response might not return full URLs immediately
          createdAt: DateTime.now(),
        ));
      } else {
        return const Left(ServerFailure(message: 'Failed to submit application'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
