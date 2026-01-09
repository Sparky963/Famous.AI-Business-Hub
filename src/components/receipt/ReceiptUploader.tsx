import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, UploadIcon, LoaderIcon, XIcon, CheckIcon } from '@/components/icons/Icons';
import Button from '@/components/ui/Button';

interface ReceiptUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onClose?: () => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or PDF file');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    if (!validateFile(file)) return;

    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await onUpload(selectedFile);
      setUploadProgress(100);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        onClose?.();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      clearInterval(progressInterval);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }
          `}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <UploadIcon size={28} className="text-white" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                Drag & drop your receipt here
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                or choose an option below
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                icon={<UploadIcon size={18} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              
              <Button
                variant="outline"
                icon={<CameraIcon size={18} />}
                onClick={() => cameraInputRef.current?.click()}
              >
                Take Photo
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              Supports JPG, PNG, WebP, PDF up to 10MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Preview & Upload */
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Receipt preview" 
                className="w-full max-h-96 object-contain"
              />
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center mb-2">
                    <UploadIcon size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">{selectedFile.name}</p>
                </div>
              </div>
            )}
            
            {!isUploading && (
              <button
                onClick={clearSelection}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <XIcon size={16} className="text-white" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-slate-500">
                {uploadProgress < 100 ? 'Processing receipt...' : 'Complete!'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={isUploading}
              icon={isUploading ? undefined : <CheckIcon size={18} />}
              className="flex-1"
            >
              {isUploading ? 'Processing...' : 'Scan Receipt'}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
