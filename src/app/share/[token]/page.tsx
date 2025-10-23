'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  File, 
  Calendar, 
  HardDrive,
  Eye,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { insforge, FileRecord } from '@/lib/insforge';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedFile();
    }
  }, [token]);

  const loadSharedFile = async () => {
    try {
      setLoading(true);
      const { data, error } = await insforge.database
        .from('files')
        .select('*')
        .eq('share_token', token)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        setError('File not found or no longer available');
        return;
      }

      setFile(data);
    } catch (error) {
      console.error('Error loading shared file:', error);
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
      // Update download count
      await insforge.database
        .from('files')
        .update({ download_count: file.download_count + 1 })
        .eq('id', file.id);

      // Update local state
      setFile(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);

      // Open file in new tab for download
      window.open(file.storage_url, '_blank');
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('text/')) return '📝';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📁';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">File Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The file you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to File Sharing</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">{getFileIcon(file.mime_type)}</span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{file.original_name}</CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant={file.is_public ? 'default' : 'secondary'}>
                    {file.is_public ? 'Public' : 'Private'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {file.download_count} downloads
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* File Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">File Size</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">File Type</p>
                    <p className="text-sm text-gray-600">{file.mime_type}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Uploaded</p>
                    <p className="text-sm text-gray-600">{formatDate(file.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Downloads</p>
                    <p className="text-sm text-gray-600">{file.download_count}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preview Section */}
            {file.mime_type.startsWith('image/') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={file.storage_url}
                    alt={file.original_name}
                    className="max-w-full h-auto max-h-96 mx-auto rounded"
                  />
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className="text-center space-y-4">
              <Button size="lg" onClick={handleDownload} className="w-full sm:w-auto">
                <Download className="h-5 w-5 mr-2" />
                Download {file.original_name}
              </Button>
              <p className="text-sm text-gray-500">
                Click to download the file to your device
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
