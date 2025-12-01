import 'package:equatable/equatable.dart';

class ApplicationEntity extends Equatable {
  final String id;
  final String type; // e.g., 'GACP_FORM_9'
  final String status; // 'draft', 'submitted', 'under_review', 'approved', 'rejected'
  final String establishmentId;
  final String establishmentName;
  final Map<String, dynamic> formData; // Flexible map for form-specific data
  final List<String> documents;
  final DateTime createdAt;

  const ApplicationEntity({
    required this.id,
    required this.type,
    required this.status,
    required this.establishmentId,
    required this.establishmentName,
    required this.formData,
    required this.documents,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, type, status, establishmentId, establishmentName, formData, documents, createdAt];
}
