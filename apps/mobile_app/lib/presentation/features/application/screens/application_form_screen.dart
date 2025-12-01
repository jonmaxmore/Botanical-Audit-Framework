import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/application_provider.dart';
import '../../establishment/providers/establishment_provider.dart';

class ApplicationFormScreen extends ConsumerStatefulWidget {
  const ApplicationFormScreen({super.key});

  @override
  ConsumerState<ApplicationFormScreen> createState() => _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends ConsumerState<ApplicationFormScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Controllers for Crop Info
  final _cropNameController = TextEditingController();
  final _varietyController = TextEditingController();
  final _sourceController = TextEditingController();

  @override
  void dispose() {
    _cropNameController.dispose();
    _varietyController.dispose();
    _sourceController.dispose();
    super.dispose();
  }

  Future<void> _pickDocument(String key, ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 80);
    if (pickedFile != null) {
      ref.read(applicationProvider.notifier).addDocument(key, File(pickedFile.path));
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(applicationProvider);
    final establishmentState = ref.watch(establishmentProvider);
    final notifier = ref.read(applicationProvider.notifier);

    // Listen for success
    ref.listen(applicationProvider, (previous, next) {
      if (next.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Application submitted successfully!')),
        );
        Navigator.pop(context);
        notifier.resetForm();
      }
      if (next.error != null && !next.isLoading) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: Colors.red),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('New GACP Application')),
      body: appState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stepper(
              currentStep: appState.currentStep,
              onStepContinue: () {
                if (appState.currentStep == 0) {
                  if (appState.selectedEstablishmentId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please select a farm')),
                    );
                    return;
                  }
                } else if (appState.currentStep == 1) {
                  if (_cropNameController.text.isEmpty) {
                     ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter crop name')),
                    );
                    return;
                  }
                  // Save form data before moving
                  notifier.updateFormData('cropName', _cropNameController.text);
                  notifier.updateFormData('variety', _varietyController.text);
                  notifier.updateFormData('source', _sourceController.text);
                } else if (appState.currentStep == 2) {
                  // Final Step - Submit
                  notifier.submitApplication();
                  return;
                }
                
                notifier.setStep(appState.currentStep + 1);
              },
              onStepCancel: () {
                if (appState.currentStep > 0) {
                  notifier.setStep(appState.currentStep - 1);
                } else {
                  Navigator.pop(context);
                }
              },
              controlsBuilder: (context, details) {
                return Padding(
                  padding: const EdgeInsets.only(top: 20),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed: details.onStepContinue,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                        child: Text(appState.currentStep == 2 ? 'Submit' : 'Continue'),
                      ),
                      const SizedBox(width: 12),
                      TextButton(
                        onPressed: details.onStepCancel,
                        child: const Text('Back'),
                      ),
                    ],
                  ),
                );
              },
              steps: [
                // Step 1: Select Farm
                Step(
                  title: const Text('Select Farm'),
                  content: establishmentState.isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : establishmentState.establishments.isEmpty
                          ? const Text('No farms found. Please create one first.')
                          : Column(
                              children: establishmentState.establishments.map((farm) {
                                return RadioListTile<String>(
                                  title: Text(farm.name),
                                  subtitle: Text(farm.address),
                                  value: farm.id,
                                  groupValue: appState.selectedEstablishmentId,
                                  onChanged: (value) {
                                    notifier.setEstablishment(value!);
                                  },
                                );
                              }).toList(),
                            ),
                  isActive: appState.currentStep >= 0,
                  state: appState.currentStep > 0 ? StepState.complete : StepState.editing,
                ),

                // Step 2: Crop Information
                Step(
                  title: const Text('Crop Information'),
                  content: Column(
                    children: [
                      TextFormField(
                        controller: _cropNameController,
                        decoration: const InputDecoration(labelText: 'Crop Name (e.g., Cannabis)'),
                      ),
                      TextFormField(
                        controller: _varietyController,
                        decoration: const InputDecoration(labelText: 'Variety (e.g., Charlotte\'s Web)'),
                      ),
                      TextFormField(
                        controller: _sourceController,
                        decoration: const InputDecoration(labelText: 'Source of Seeds/Clones'),
                      ),
                    ],
                  ),
                  isActive: appState.currentStep >= 1,
                  state: appState.currentStep > 1 ? StepState.complete : StepState.editing,
                ),

                // Step 3: Documents
                Step(
                  title: const Text('Documents'),
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _DocumentUploadField(
                        label: 'ID Card / Passport',
                        docKey: 'id_card',
                        file: appState.documents['id_card'],
                        onUpload: () => _pickDocument('id_card', ImageSource.gallery),
                        onRemove: () => notifier.removeDocument('id_card'),
                      ),
                      const SizedBox(height: 16),
                      _DocumentUploadField(
                        label: 'Land Title Deed',
                        docKey: 'land_title',
                        file: appState.documents['land_title'],
                        onUpload: () => _pickDocument('land_title', ImageSource.gallery),
                        onRemove: () => notifier.removeDocument('land_title'),
                      ),
                      const SizedBox(height: 16),
                      _DocumentUploadField(
                        label: 'Map / Layout',
                        docKey: 'farm_map',
                        file: appState.documents['farm_map'],
                        onUpload: () => _pickDocument('farm_map', ImageSource.gallery),
                        onRemove: () => notifier.removeDocument('farm_map'),
                      ),
                    ],
                  ),
                  isActive: appState.currentStep >= 2,
                  state: appState.currentStep == 2 ? StepState.editing : StepState.indexed,
                ),
              ],
            ),
    );
  }
}

class _DocumentUploadField extends StatelessWidget {
  final String label;
  final String docKey;
  final File? file;
  final VoidCallback onUpload;
  final VoidCallback onRemove;

  const _DocumentUploadField({
    required this.label,
    required this.docKey,
    this.file,
    required this.onUpload,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (file != null)
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(LucideIcons.fileCheck, color: Colors.green),
            title: Text('File selected'),
            trailing: IconButton(
              icon: const Icon(Icons.close, color: Colors.red),
              onPressed: onRemove,
            ),
          )
        else
          OutlinedButton.icon(
            onPressed: onUpload,
            icon: const Icon(LucideIcons.upload),
            label: const Text('Upload Document'),
          ),
      ],
    );
  }
}
