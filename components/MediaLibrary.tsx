import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, AlertCircle, Image, RefreshCw, Trash2 } from 'lucide-react';
import { mediaApi, MediaItem } from '../services/api';
import { useModal } from './Modal';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  alt?: string;
  caption?: string;
}

const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media from API
  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mediaApi.getAll({ limit: 100 });
      const mappedMedia = response.data.map((item: MediaItem) => ({
        id: item.id,
        url: item.url,
        name: item.filename,
        type: item.mimeType,
        size: item.size,
        alt: item.alt,
        caption: item.caption,
      }));
      setMedia(mappedMedia);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Failed to load media library. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Handle file upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
        const uploaded = await mediaApi.upload(file);
        setMedia(prev => [{
          id: uploaded.id,
          url: uploaded.url,
          name: uploaded.filename,
          type: uploaded.mimeType,
          size: uploaded.size,
          alt: uploaded.alt,
          caption: uploaded.caption,
        }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const { confirm } = useModal();

  // Handle delete
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete File',
      message: 'Are you sure you want to delete this file?',
      confirmText: 'Delete',
      variant: 'warning'
    });
    if (!confirmed) return;

    try {
      await mediaApi.delete(id);
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError('Failed to delete file. Please try again.');
    }
  };

  // Filter media
  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.type.startsWith('image/');
    if (filter === 'audio') return item.type.startsWith('audio/');
    if (filter === 'video') return item.type.startsWith('video/');
    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-600">Loading media library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Media Library</h1>
        <div className="flex gap-2">
          <button 
            onClick={fetchMedia}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={18} className="mr-2" /> Refresh
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Upload size={18} className="mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload New'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 flex gap-4">
          <select 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All media items</option>
            <option value="images">Images</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>
        
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Image className="w-12 h-12 mb-4 text-gray-300" />
            <p className="font-medium">No media files</p>
            <p className="text-sm">Upload files to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="relative group aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden cursor-pointer"
              >
                {item.type.startsWith('image/') ? (
                  <img 
                    src={item.url} 
                    alt={item.alt || item.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-gray-500 uppercase">{item.type.split('/')[1]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-1 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;