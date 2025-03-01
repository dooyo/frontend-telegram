import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { ImageIcon, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUploadPermission, confirmUpload } from '@/lib/api/posts';
import { supabase } from '@/lib/supabase';

// Maximum number of files that can be uploaded
const MAX_FILES = 10;
// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id?: string; // ID from the server after confirmation
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  error?: string;
}

interface MediaUploadProps {
  mediaFiles: MediaFile[];
  onMediaFilesChange: (files: MediaFile[]) => void;
  className?: string;
  disabled?: boolean;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  mediaFiles,
  onMediaFilesChange,
  className,
  disabled = false
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      setIsLoading(true);

      const selectedFiles = Array.from(e.target.files || []);
      console.log('Selected files:', selectedFiles.length);

      // Check if adding these files would exceed the maximum
      if (mediaFiles.length + selectedFiles.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} files`);
        setIsLoading(false);
        return;
      }

      // Validate file types and sizes
      const invalidFiles = selectedFiles.filter(
        (file) =>
          !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
      );

      if (invalidFiles.length > 0) {
        setError(
          `Some files were not added. Files must be images (JPG, PNG, GIF, WEBP) or videos (MP4, WEBM, MOV) and less than 10MB.`
        );
      }

      // Process valid files
      const validFiles = selectedFiles.filter(
        (file) =>
          ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
      );
      console.log('Valid files:', validFiles.length);

      // Create preview URLs for each file
      const newMediaFiles = validFiles.map((file) => {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        return {
          file,
          preview: URL.createObjectURL(file),
          type: isImage ? 'image' : ('video' as 'image' | 'video'),
          status: 'pending' as const,
          progress: 0
        };
      });
      console.log('New media files created:', newMediaFiles.length);

      // Update state with new files
      const updatedFiles = [...mediaFiles, ...newMediaFiles];
      console.log('Total media files after update:', updatedFiles.length);
      onMediaFilesChange(updatedFiles);
      setIsLoading(false);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Start uploading each file
      for (const mediaFile of newMediaFiles) {
        await uploadFile(mediaFile, updatedFiles.indexOf(mediaFile));
      }
    },
    [mediaFiles, onMediaFilesChange]
  );

  const uploadFile = async (mediaFile: MediaFile, index: number) => {
    try {
      console.log(
        'Starting upload for file:',
        mediaFile.file.name,
        'at index:',
        index
      );

      // Update status to uploading
      const updatedFiles = [...mediaFiles];
      updatedFiles[index] = {
        ...mediaFile, // Preserve all original properties
        status: 'uploading' as const,
        progress: 50
      };
      onMediaFilesChange(updatedFiles);

      // Step 1: Get upload permission from our backend
      const permission = await getUploadPermission(
        mediaFile.file.type,
        mediaFile.file.size,
        mediaFile.file.name
      );

      // Step 2: Extract the token from the signed URL
      // The URL format is: https://[project_id].supabase.co/storage/v1/object/upload/sign/[bucket]/[path]?token=[token]
      const url = new URL(permission.uploadUrl);
      const token = url.searchParams.get('token');

      if (!token) {
        throw new Error('Invalid upload URL: missing token');
      }

      // Step 3: Upload directly to Supabase using the uploadToSignedUrl method
      const { error: uploadError } = await supabase.storage
        .from('media')
        .uploadToSignedUrl(permission.fileName, token, mediaFile.file, {
          contentType: mediaFile.file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Step 4: Confirm upload with our backend
      const mediaRecord = await confirmUpload(
        permission.fileId,
        mediaFile.file.type,
        mediaFile.file.size
      );

      console.log(
        'Upload successful, updating media file with ID:',
        mediaRecord.id
      );

      // Update the media file with the server ID and status
      const finalUpdatedFiles = [...mediaFiles];
      finalUpdatedFiles[index] = {
        ...mediaFile, // Preserve all original properties
        id: mediaRecord.id,
        status: 'uploaded' as const,
        progress: 100
      };
      console.log(
        'Updated file at index',
        index,
        ':',
        finalUpdatedFiles[index]
      );
      onMediaFilesChange(finalUpdatedFiles);
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';

      // Update the file with error status
      const updatedFiles = [...mediaFiles];
      updatedFiles[index] = {
        ...mediaFile, // Preserve all original properties
        status: 'error' as const,
        error: errorMessage
      };
      onMediaFilesChange(updatedFiles);

      setError(`Failed to upload ${mediaFile.file.name}: ${errorMessage}`);
    }
  };

  const handleRemoveFile = useCallback(
    (indexToRemove: number) => {
      // Release the object URL to avoid memory leaks
      if (mediaFiles[indexToRemove]?.preview) {
        URL.revokeObjectURL(mediaFiles[indexToRemove].preview);
      }

      // Remove the file from the array
      const updatedFiles = mediaFiles.filter(
        (_, index) => index !== indexToRemove
      );
      onMediaFilesChange(updatedFiles);

      // Adjust active index if necessary
      if (activeIndex >= updatedFiles.length) {
        setActiveIndex(Math.max(0, updatedFiles.length - 1));
      }
    },
    [mediaFiles, onMediaFilesChange, activeIndex]
  );

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaFiles.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < mediaFiles.length - 1 ? prev + 1 : 0));
  };

  const getStatusIndicator = (mediaFile: MediaFile) => {
    switch (mediaFile.status) {
      case 'uploading':
        return (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <Upload className="h-6 w-6 mx-auto animate-pulse" />
              <div className="mt-2 text-sm">{mediaFile.progress}%</div>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
            <div className="text-white text-center p-2">
              <X className="h-6 w-6 mx-auto" />
              <div className="mt-2 text-xs">
                {mediaFile.error || 'Upload failed'}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        disabled={disabled}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleTriggerFileInput}
        className="w-full flex items-center justify-center gap-2 h-12"
        disabled={disabled || mediaFiles.length >= MAX_FILES}
      >
        <ImageIcon className="w-5 h-5" />
        <span>Add Photos/Videos</span>
        {mediaFiles.length > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            ({mediaFiles.length}/{MAX_FILES})
          </span>
        )}
      </Button>

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive p-2 rounded-lg bg-destructive/10">
          {error}
        </div>
      )}

      {/* Media preview carousel */}
      {mediaFiles.length > 0 && (
        <div className="relative rounded-lg overflow-hidden bg-black/5">
          {/* Loading state */}
          {isLoading && (
            <Skeleton className="w-full aspect-square max-h-[400px]" />
          )}

          {/* Media display */}
          <div className={cn('relative', isLoading && 'hidden')}>
            {mediaFiles.map((media, index) => {
              // More specific null checks with console logging
              if (!media) {
                console.log('Media is undefined at index', index);
                return null;
              }

              // Check if file exists but log more info
              if (!media.file) {
                console.log('Media file is undefined for media:', media);
                // If we have a preview but no file, we can still show the preview
                if (media.preview && media.type) {
                  return (
                    <div
                      key={`preview-${index}`}
                      className={cn(
                        'w-full aspect-square max-h-[400px] flex items-center justify-center relative',
                        index !== activeIndex && 'hidden'
                      )}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.preview}
                          alt={`Preview ${index + 1}`}
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      ) : (
                        <video
                          src={media.preview}
                          className="max-w-full max-h-[400px] object-contain"
                          controls
                          playsInline
                        />
                      )}

                      {/* Status indicator overlay */}
                      {getStatusIndicator(media)}

                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background border shadow-sm"
                        onClick={() => handleRemoveFile(index)}
                        aria-label="Remove media"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }
                return null;
              }

              return (
                <div
                  key={`${
                    media.file ? media.file.name : `media-${index}`
                  }-${index}`}
                  className={cn(
                    'w-full aspect-square max-h-[400px] flex items-center justify-center relative',
                    index !== activeIndex && 'hidden'
                  )}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.preview}
                      alt={`Preview ${index + 1}`}
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    <video
                      src={media.preview}
                      className="max-w-full max-h-[400px] object-contain"
                      controls
                      playsInline
                    />
                  )}

                  {/* Status indicator overlay */}
                  {getStatusIndicator(media)}

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background border shadow-sm"
                    onClick={() => handleRemoveFile(index)}
                    aria-label="Remove media"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {/* Navigation buttons (only show if more than one file) */}
            {mediaFiles.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background border shadow-sm"
                  onClick={handlePrevious}
                  aria-label="Previous media"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background border shadow-sm"
                  onClick={handleNext}
                  aria-label="Next media"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Pagination indicators */}
          {mediaFiles.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {mediaFiles.map((media, index) => {
                // More specific null check for pagination indicators
                if (!media) {
                  return null;
                }

                // We can show pagination indicators even if file is missing
                return (
                  <button
                    key={index}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      index === activeIndex
                        ? 'bg-primary'
                        : 'bg-background/50 hover:bg-background/80',
                      media.status === 'error' && 'bg-destructive'
                    )}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to media ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
