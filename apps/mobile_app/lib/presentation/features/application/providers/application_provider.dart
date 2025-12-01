import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../data/repositories/application_repository_impl.dart';
import '../../../../domain/entities/application_entity.dart';
import '../../../../domain/repositories/application_repository.dart';
import '../../auth/providers/auth_provider.dart';

// 1. Repository Provider
final applicationRepositoryProvider = Provider<ApplicationRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return ApplicationRepositoryImpl(dioClient);
});

// 2. State Class
class ApplicationState {
  final bool isLoading;
  final List<ApplicationEntity> applications;
  final String? error;
  
  // Form State
  final int currentStep;
  final String? selectedEstablishmentId;
  final Map<String, dynamic> formData;
  final Map<String, File> documents;
  final bool isSuccess;

  const ApplicationState({
    this.isLoading = false,
    this.applications = const [],
    this.error,
    this.currentStep = 0,
    this.selectedEstablishmentId,
    this.formData = const {},
    this.documents = const {},
    this.isSuccess = false,
  });

  ApplicationState copyWith({
    bool? isLoading,
    List<ApplicationEntity>? applications,
    String? error,
    int? currentStep,
    String? selectedEstablishmentId,
    Map<String, dynamic>? formData,
    Map<String, File>? documents,
    bool? isSuccess,
  }) {
    return ApplicationState(
      isLoading: isLoading ?? this.isLoading,
      applications: applications ?? this.applications,
      error: error,
      currentStep: currentStep ?? this.currentStep,
      selectedEstablishmentId: selectedEstablishmentId ?? this.selectedEstablishmentId,
      formData: formData ?? this.formData,
      documents: documents ?? this.documents,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

// 3. Notifier
class ApplicationNotifier extends StateNotifier<ApplicationState> {
  final ApplicationRepository _repository;

  ApplicationNotifier(this._repository) : super(const ApplicationState()) {
    loadApplications();
  }

  Future<void> loadApplications() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _repository.getMyApplications();
    result.fold(
      (failure) => state = state.copyWith(isLoading: false, error: failure.message),
      (data) => state = state.copyWith(isLoading: false, applications: data),
    );
  }

  void setStep(int step) {
    state = state.copyWith(currentStep: step);
  }

  void setEstablishment(String id) {
    state = state.copyWith(selectedEstablishmentId: id);
  }

  void updateFormData(String key, dynamic value) {
    final newFormData = Map<String, dynamic>.from(state.formData);
    newFormData[key] = value;
    state = state.copyWith(formData: newFormData);
  }

  void addDocument(String key, File file) {
    final newDocs = Map<String, File>.from(state.documents);
    newDocs[key] = file;
    state = state.copyWith(documents: newDocs);
  }

  void removeDocument(String key) {
    final newDocs = Map<String, File>.from(state.documents);
    newDocs.remove(key);
    state = state.copyWith(documents: newDocs);
  }

  Future<void> submitApplication() async {
    if (state.selectedEstablishmentId == null) {
      state = state.copyWith(error: 'Please select an establishment');
      return;
    }

    state = state.copyWith(isLoading: true, error: null, isSuccess: false);

    final result = await _repository.createApplication(
      establishmentId: state.selectedEstablishmentId!,
      type: 'GACP_FORM_9',
      formData: state.formData,
      documents: state.documents,
    );

    result.fold(
      (failure) => state = state.copyWith(isLoading: false, error: failure.message),
      (newItem) {
        final newList = [...state.applications, newItem];
        state = state.copyWith(
          isLoading: false,
          applications: newList,
          isSuccess: true,
          currentStep: 0,
          formData: {},
          documents: {},
          selectedEstablishmentId: null,
        );
      },
    );
  }

  void resetForm() {
    state = state.copyWith(
      isSuccess: false,
      error: null,
      currentStep: 0,
      formData: {},
      documents: {},
      selectedEstablishmentId: null,
    );
  }
}

// 4. Provider
final applicationProvider = StateNotifierProvider<ApplicationNotifier, ApplicationState>((ref) {
  final repository = ref.watch(applicationRepositoryProvider);
  return ApplicationNotifier(repository);
});
