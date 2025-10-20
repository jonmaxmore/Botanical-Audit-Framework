'use client';

import { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CloudUpload, ArrowBack, CheckCircle } from '@mui/icons-material';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  documentUploadSchema,
  DocumentUploadFormData,
  DOCUMENT_TYPES,
  formatFileSize,
} from '@/lib/validations/documentSchema';
import { uploadDocument } from '@/lib/api/documents';

export default function DocumentUploadPage() {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DocumentUploadFormData>({
    resolver: yupResolver(documentUploadSchema),
    defaultValues: {
      documentTitle: '',
      documentType: '',
      description: '',
      file: undefined,
    },
  });

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue('file', file, { shouldValidate: true });
    }
  };

  // Handle form submission
  const onSubmit = async (data: DocumentUploadFormData) => {
    try {
      setUploadError(null);

      await uploadDocument({
        documentTitle: data.documentTitle,
        documentType: data.documentType,
        description: data.description,
        file: data.file,
      });

      setUploadSuccess(true);
      setSelectedFile(null);
      reset();

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/farmer/documents/list';
      }, 2000);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload document. Please try again.'
      );
    }
  };

  return (
    <DashboardLayout userRole="farmer">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Link
            href="/farmer/documents"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3"
          >
            <ArrowBack className="mr-1" fontSize="small" />
            Back to Documents
          </Link>
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            Upload New Document 📤
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Upload your GACP certification documents for review.
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {uploadSuccess && (
          <Alert severity="success" className="mb-4 max-w-3xl" icon={<CheckCircle />}>
            <strong>Success!</strong> Document uploaded successfully. Redirecting to document
            list...
          </Alert>
        )}

        {uploadError && (
          <Alert severity="error" className="mb-4 max-w-3xl" onClose={() => setUploadError(null)}>
            <strong>Error:</strong> {uploadError}
          </Alert>
        )}

        {/* Upload Form */}
        <Paper className="p-6 max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Document Title */}
            <Box className="mb-4">
              <Controller
                name="documentTitle"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Document Title"
                    placeholder="e.g., Farm Registration Certificate"
                    variant="outlined"
                    required
                    error={!!errors.documentTitle}
                    helperText={errors.documentTitle?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Box>

            {/* Document Type */}
            <Box className="mb-4">
              <Controller
                name="documentType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.documentType}>
                    <InputLabel>Document Type</InputLabel>
                    <Select {...field} label="Document Type" disabled={isSubmitting}>
                      <MenuItem value="">Select document type...</MenuItem>
                      {DOCUMENT_TYPES.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.documentType && (
                      <Typography variant="caption" className="text-red-600 mt-1 ml-3">
                        {errors.documentType.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {/* Description */}
            <Box className="mb-4">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description (Optional)"
                    placeholder="Brief description of the document..."
                    variant="outlined"
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Box>

            {/* File Upload */}
            <Box className="mb-4">
              <Controller
                name="file"
                control={control}
                render={({ field: { onChange, value: _, ...field } }) => (
                  <Box>
                    <Box
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        errors.file
                          ? 'border-red-400 hover:border-red-500'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      <CloudUpload
                        className={errors.file ? 'text-red-400' : 'text-gray-400'}
                        sx={{ fontSize: 48, mb: 2 }}
                      />
                      <Typography variant="body1" className="text-gray-700 mb-1">
                        {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        {selectedFile
                          ? `Size: ${formatFileSize(selectedFile.size)}`
                          : 'Supported formats: PDF, JPG, PNG (Max 10MB)'}
                      </Typography>
                      <input
                        {...field}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="file-upload"
                        value=""
                        onChange={e => {
                          handleFileChange(e);
                          onChange(e.target.files?.[0]);
                        }}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          className="mt-3"
                          disabled={isSubmitting}
                        >
                          {selectedFile ? 'Change File' : 'Choose File'}
                        </Button>
                      </label>
                    </Box>
                    {errors.file && (
                      <Typography variant="caption" className="text-red-600 mt-1 ml-3 block">
                        {errors.file.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            {/* Week 2 Notice */}
            <Alert severity="success" className="mb-4">
              <strong>✅ Week 2 Day 1 Complete:</strong> Form validation with React Hook Form + Yup
              is now active! File upload will connect to backend API once server is running.
            </Alert>

            {/* Action Buttons */}
            <Box className="flex gap-3">
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />
                }
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Link href="/farmer/documents">
                <Button
                  variant="outlined"
                  size="large"
                  className="border-gray-300 text-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
            </Box>
          </form>
        </Paper>

        {/* Instructions */}
        <Paper className="p-6 mt-6 max-w-3xl">
          <Typography variant="h6" className="font-semibold mb-3">
            📋 Upload Guidelines
          </Typography>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Ensure all documents are clear and readable</li>
            <li>File size should not exceed 10MB</li>
            <li>Supported formats: PDF, JPG, PNG</li>
            <li>Include all required information in the document</li>
            <li>Documents will be reviewed by DTAM staff within 3-5 business days</li>
          </ul>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
