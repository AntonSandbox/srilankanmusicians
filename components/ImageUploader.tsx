'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete: (id: string) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get upload URL from our secure API
      setProgress(10);
      const urlResponse = await fetch('/api/images/get-upload-url', {
        method: 'POST',
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, id } = await urlResponse.json();
      setProgress(30);

      // 2. Upload file directly to Cloudflare
      const formData = new FormData();
      formData.append('file', file);

      // We use XMLHttpRequest here instead of fetch to get upload progress
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 70) + 30; // Scale 30-100%
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload to Cloudflare failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        
        xhr.open('POST', uploadURL);
        xhr.send(formData);
      });

      await uploadPromise;
      
      setProgress(100);
      setSuccess(true);
      onUploadComplete(id);

    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {!isUploading && !success && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleButtonClick}
          className="w-full flex items-center justify-center gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          Select Image
        </Button>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>
      )}

      {success && !isUploading && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>Upload complete!</span>
          <Button 
            type="button" 
            variant="link" 
            onClick={handleButtonClick}
            className="ml-auto h-auto p-0 text-green-700 hover:text-green-800"
          >
            Upload another
          </Button>
        </div>
      )}

      {error && !isUploading && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button 
            type="button" 
            variant="link" 
            onClick={handleButtonClick}
            className="ml-auto h-auto p-0 text-red-700 hover:text-red-800"
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
