'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X } from 'lucide-react';
import { insforge, FileRecord } from '@/lib/insforge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (file: FileRecord) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, [user]);

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;

      // Upload to InsForge storage
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('file-sharing')
        .upload(fileName, file);

      if (uploadError || !uploadData) {
        throw new Error(uploadError?.message || 'Upload failed');
      }

      // Generate share token
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);

      // Save file record to database
      const { data: fileRecord, error: dbError } = await insforge.database
        .from('files')
        .insert([{
          user_id: user.id,
          name: fileName,
          original_name: file.name,
          size: file.size,
          mime_type: file.type,
          storage_url: uploadData.url,
          storage_key: uploadData.key,
          share_token: shareToken,
          is_public: false,
        }])
        .select()
        .single();

      if (dbError) {
        throw new Error(dbError.message);
      }

      setUploadProgress(100);
      onUploadComplete(fileRecord);
      toast.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading || !user,
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to select files
          </p>
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
