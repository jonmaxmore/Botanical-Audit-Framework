import * as yup from 'yup';

// Document types allowed in the system
export const DOCUMENT_TYPES = [
  'Farm Registration',
  'Land Certificate',
  'Cultivation Plan',
  'Water Test Results',
  'Soil Test Results',
  'Organic Certificate',
  'Other',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Helper function to validate file
export const validateFile = (file: File | null | undefined): boolean => {
  if (!file) return false;

  // Check file size
  if (file.size > MAX_FILE_SIZE) return false;

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return false;

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  return hasValidExtension;
};

// Document upload form validation schema
export const documentUploadSchema = yup
  .object({
    documentTitle: yup
      .string()
      .required('Document title is required')
      .min(5, 'Document title must be at least 5 characters')
      .max(100, 'Document title must not exceed 100 characters')
      .trim(),

    documentType: yup
      .string()
      .required('Document type is required')
      .oneOf(DOCUMENT_TYPES as unknown as string[], 'Please select a valid document type'),

    description: yup
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .trim()
      .optional(),

    file: yup
      .mixed<File>()
      .required('File is required')
      .test('fileSize', 'File size must not exceed 10MB', (value) => {
        if (!value) return false;
        return value.size <= MAX_FILE_SIZE;
      })
      .test('fileType', 'Only PDF, JPG, JPEG, and PNG files are allowed', (value) => {
        if (!value) return false;
        return ALLOWED_FILE_TYPES.includes(value.type);
      })
      .test('fileExtension', 'Invalid file extension', (value) => {
        if (!value) return false;
        const fileName = value.name.toLowerCase();
        return ALLOWED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
      }),
  })
  .required();

// TypeScript type for the form data
export type DocumentUploadFormData = yup.InferType<typeof documentUploadSchema>;

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Helper function to check if file type is image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Helper function to check if file type is PDF
export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};
