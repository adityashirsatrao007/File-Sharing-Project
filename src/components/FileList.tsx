'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  File, 
  Download, 
  Share2, 
  Trash2, 
  MoreVertical, 
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { insforge, FileRecord } from '@/lib/insforge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FileListProps {
  files: FileRecord[];
  onFileDeleted: (fileId: string) => void;
  onFileUpdated: (file: FileRecord) => void;
}

export function FileList({ files, onFileDeleted, onFileUpdated }: FileListProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

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
      month: 'short',
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

  const handleDelete = async (fileId: string) => {
    if (!user) return;

    setDeleting(fileId);
    try {
      const { error } = await insforge.database
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) {
        throw new Error(error.message);
      }

      onFileDeleted(fileId);
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublic = async (file: FileRecord) => {
    if (!user) return;

    try {
      const { data, error } = await insforge.database
        .from('files')
        .update({ is_public: !file.is_public })
        .eq('id', file.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      onFileUpdated(data);
      toast.success(`File ${data.is_public ? 'made public' : 'made private'}`);
    } catch (error) {
      console.error('Toggle public error:', error);
      toast.error('Failed to update file visibility');
    }
  };

  const handleCopyShareLink = (file: FileRecord) => {
    const shareUrl = `${window.location.origin}/share/${file.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  const handleDownload = async (file: FileRecord) => {
    try {
      // Update download count
      await insforge.database
        .from('files')
        .update({ download_count: file.download_count + 1 })
        .eq('id', file.id);

      // Open file in new tab for download
      window.open(file.storage_url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No files uploaded yet</p>
          <p className="text-sm text-gray-400">Upload your first file to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {file.original_name}
                  </h3>
                  <Badge variant={file.is_public ? 'default' : 'secondary'}>
                    {file.is_public ? 'Public' : 'Private'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{formatDate(file.created_at)}</span>
                  <span>•</span>
                  <span>{file.download_count} downloads</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyShareLink(file)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTogglePublic(file)}>
                      {file.is_public ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600"
                      disabled={deleting === file.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting === file.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
