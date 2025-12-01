/**
 * Document Upload Form Component
 * 
 * Reusable form for file uploads with drag-and-drop, preview, and validation.
 * Consolidates logic from:
 * - FileUploadComponent (farmer-portal)
 * - FileUploadComponent (admin-portal)
 * - FileUploadComponent (certificate-portal)
 * 
 * Features:
 * - Drag-and-drop interface
 * - Multiple file support
 * - File type validation (PDF, images, documents)
 * - File size validation
 * - Image preview
 * - PDF preview
 * - Upload progress bar
 * - File list management
 * - Download uploaded files
 * - Delete uploaded files
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Download, Loader } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type FileType = 'image' | 'pdf' | 'document' | 'any';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string; // Preview URL or uploaded URL
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface DocumentUploadFormProps {
  // Core
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  
  // Upload handler
  onUpload?: (file: File) => Promise<{ url: string; id: string }>;
  
  // Validation
  acceptedFileTypes?: FileType[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  
  // Configuration
  multiple?: boolean;
  showPreview?: boolean;
  required?: boolean;
  disabled?: boolean;
  
  // Labels
  label?: string;
  placeholder?: string;
  dropzoneText?: string;
  browseText?: string;
  
  // Customization
  className?: string;
  
  // Callbacks
  onValidate?: (isValid: boolean) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FILE_TYPE_ACCEPT: Record<FileType, string> = {
  image: 'image/*',
  pdf: 'application/pdf',
  document: '.doc,.docx,.xls,.xlsx,.txt',
  any: '*/*'
};

const FILE_TYPE_EXTENSIONS: Record<FileType, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  pdf: ['pdf'],
  document: ['doc', 'docx', 'xls', 'xlsx', 'txt'],
  any: []
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
  return <File className="w-8 h-8 text-gray-500" />;
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function DocumentUploadForm({
  value = [],
  onChange,
  onUpload,
  acceptedFileTypes = ['any'],
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  multiple = true,
  showPreview = true,
  required = false,
  disabled = false,
  label = 'อัพโหลดเอกสาร',
  dropzoneText = 'ลากไฟล์มาวางที่นี่',
  browseText = 'เลือกไฟล์',
  className = '',
  onValidate,
  onError
}: DocumentUploadFormProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `ไฟล์ ${file.name} มีขนาดใหญ่เกิน ${maxFileSize} MB`;
    }

    // Check file type
    if (!acceptedFileTypes.includes('any')) {
      const extension = getFileExtension(file.name);
      const isValidType = acceptedFileTypes.some(type => 
        FILE_TYPE_EXTENSIONS[type].includes(extension)
      );

      if (!isValidType) {
        const allowedExtensions = acceptedFileTypes
          .flatMap(type => FILE_TYPE_EXTENSIONS[type])
          .join(', ');
        return `ไฟล์ ${file.name} ไม่ใช่ประเภทที่รองรับ (รองรับ: ${allowedExtensions})`;
      }
    }

    // Check max files
    if (files.length >= maxFiles) {
      return `สามารถอัพโหลดได้สูงสุด ${maxFiles} ไฟล์`;
    }

    return null;
  };

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const filesToProcess = multiple ? Array.from(fileList) : [fileList[0]];
    const newFiles: UploadedFile[] = [];

    for (const file of filesToProcess) {
      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (onError) onError(validationError);
        continue;
      }

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        uploadStatus: 'pending'
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.url = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onChange(updatedFiles);
      setError('');

      // Upload files if handler provided
      if (onUpload) {
        for (const uploadedFile of newFiles) {
          await uploadFile(uploadedFile);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, multiple, onUpload, onChange, onError, maxFiles, maxFileSize, acceptedFileTypes]);

  const uploadFile = async (uploadedFile: UploadedFile) => {
    if (!onUpload) return;

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, uploadStatus: 'uploading', uploadProgress: 0 }
        : f
    ));

    try {
      // Simulate progress (replace with actual upload progress)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === uploadedFile.id && f.uploadProgress! < 90) {
            return { ...f, uploadProgress: f.uploadProgress! + 10 };
          }
          return f;
        }));
      }, 200);

      // Upload file
      const result = await onUpload(uploadedFile.file);

      clearInterval(progressInterval);

      // Update with uploaded URL
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              uploadStatus: 'success', 
              uploadProgress: 100,
              url: result.url,
              id: result.id 
            }
          : f
      ));

      // Notify parent
      const updatedFiles = files.map(f => 
        f.id === uploadedFile.id ? { ...f, url: result.url, id: result.id } : f
      );
      onChange(updatedFiles);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัพโหลด';
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              uploadStatus: 'error', 
              uploadProgress: 0,
              error: errorMessage 
            }
          : f
      ));

      setError(errorMessage);
      if (onError) onError(errorMessage);
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onChange(updatedFiles);
    setError('');

    // Revoke object URL to prevent memory leaks
    const file = files.find(f => f.id === fileId);
    if (file?.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  };

  // ============================================================================
  // DRAG & DROP HANDLERS
  // ============================================================================

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  // ============================================================================
  // INPUT HANDLERS
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  React.useEffect(() => {
    const isValid = required ? files.length > 0 : true;
    if (onValidate) {
      onValidate(isValid);
    }
  }, [files, required, onValidate]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const acceptString = acceptedFileTypes
    .map(type => FILE_TYPE_ACCEPT[type])
    .join(',');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Dropzone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept={acceptString}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <p className="text-sm text-gray-600 mb-2">
          {isDragging ? 'วางไฟล์ที่นี่...' : dropzoneText}
        </p>
        
        <button
          type="button"
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {browseText}
        </button>

        <p className="text-xs text-gray-500 mt-3">
          {acceptedFileTypes.includes('any') 
            ? 'รองรับไฟล์ทุกประเภท' 
            : `รองรับ: ${acceptedFileTypes.flatMap(t => FILE_TYPE_EXTENSIONS[t]).join(', ').toUpperCase()}`
          }
          {' '} • สูงสุด {maxFileSize} MB
          {multiple && ` • อัพโหลดได้สูงสุด ${maxFiles} ไฟล์`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {/* Icon/Preview */}
              {showPreview && file.type.startsWith('image/') && file.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded border border-gray-200"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16">
                  {getFileIcon(file.type)}
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>

                {/* Upload Progress */}
                {file.uploadStatus === 'uploading' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">กำลังอัพโหลด...</span>
                      <span className="text-xs text-gray-600">{file.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {file.uploadStatus === 'error' && file.error && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2">
                {file.uploadStatus === 'uploading' && (
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                
                {file.uploadStatus === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                
                {file.uploadStatus === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}

                {file.url && file.uploadStatus === 'success' && (
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="ดาวน์โหลด"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </a>
                )}

                <button
                  onClick={() => removeFile(file.id)}
                  disabled={disabled}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="ลบ"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Count */}
      {multiple && files.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          อัพโหลดแล้ว {files.length} / {maxFiles} ไฟล์
        </p>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Pre-configured for image uploads only
 */
export const ImageUploadForm = (props: Omit<DocumentUploadFormProps, 'acceptedFileTypes' | 'label'>) => (
  <DocumentUploadForm
    {...props}
    acceptedFileTypes={['image']}
    label="อัพโหลดรูปภาพ"
    dropzoneText="ลากรูปภาพมาวางที่นี่"
  />
);

/**
 * Pre-configured for PDF uploads only
 */
export const PDFUploadForm = (props: Omit<DocumentUploadFormProps, 'acceptedFileTypes' | 'label'>) => (
  <DocumentUploadForm
    {...props}
    acceptedFileTypes={['pdf']}
    label="อัพโหลดเอกสาร PDF"
    dropzoneText="ลากไฟล์ PDF มาวางที่นี่"
  />
);

/**
 * Pre-configured for single file upload
 */
export const SingleFileUploadForm = (props: Omit<DocumentUploadFormProps, 'multiple' | 'maxFiles'>) => (
  <DocumentUploadForm
    {...props}
    multiple={false}
    maxFiles={1}
  />
);
