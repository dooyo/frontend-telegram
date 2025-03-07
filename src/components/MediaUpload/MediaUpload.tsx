import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUploadPermission, confirmUpload } from '@/lib/api/posts';
import { supabase } from '@/lib/supabase';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

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
  preview: string; // Now this will be the Supabase URL after upload
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

export interface MediaUploadRef {
  uploadAllPendingFiles: () => Promise<string[]>;
}

export const MediaUpload = forwardRef<MediaUploadRef, MediaUploadProps>(
  ({ mediaFiles, onMediaFilesChange, className, disabled = false }, ref) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [showGrid, setShowGrid] = useState(true);

    // Get Telegram launch params to detect platform
    const launchParams = retrieveLaunchParams();
    const isMobile = ['android', 'ios', 'ipados'].includes(
      launchParams.tgWebAppPlatform
    );

    console.log(
      'MediaUpload running on platform:',
      launchParams.tgWebAppPlatform,
      'isMobile:',
      isMobile
    );

    // Expose the uploadAllPendingFiles method via ref
    useImperativeHandle(
      ref,
      () => ({
        uploadAllPendingFiles: async () => {
          // With our new approach, files should already be uploaded
          // This is now just returning the IDs of already uploaded files
          const uploadedFiles = mediaFiles.filter(
            (file) => file.status === 'uploaded' && file.id
          );

          const uploadedIds = uploadedFiles
            .map((file) => file.id)
            .filter((id): id is string => id !== undefined);

          console.log(`Found ${uploadedIds.length} uploaded files`);
          return uploadedIds;
        }
      }),
      [mediaFiles]
    );

    // Remove debug useEffects but keep the activeIndex validation
    useEffect(() => {
      // Ensure activeIndex is valid
      if (mediaFiles.length > 0 && activeIndex >= mediaFiles.length) {
        setActiveIndex(mediaFiles.length - 1);
      } else if (mediaFiles.length === 0 && activeIndex !== 0) {
        setActiveIndex(0);
      }
    }, [mediaFiles, activeIndex]);

    const uploadFile = async (file: File): Promise<MediaFile> => {
      try {
        // Step 1: Get upload permission from our backend
        const permission = await getUploadPermission(
          file.type,
          file.size,
          file.name
        );

        // Step 2: Extract the token from the signed URL
        const url = new URL(permission.uploadUrl);
        const token = url.searchParams.get('token');

        if (!token) {
          throw new Error('Invalid upload URL: missing token');
        }

        // Step 3: Upload directly to Supabase using the uploadToSignedUrl method
        const { error: uploadError } = await supabase.storage
          .from('media')
          .uploadToSignedUrl(permission.fileName, token, file, {
            contentType: file.type
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Step 4: Confirm upload with our backend
        const mediaRecord = await confirmUpload(
          permission.fileId,
          file.type,
          file.size
        );

        // Create and return the MediaFile object
        return {
          file,
          preview: mediaRecord.url, // Use the real URL from Supabase
          type: ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video',
          id: mediaRecord.id,
          status: 'uploaded',
          progress: 100
        };
      } catch (err) {
        console.error('Upload error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';

        // Return error state
        return {
          file,
          preview: '', // No preview for error state
          type: ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video',
          status: 'error',
          progress: 0,
          error: errorMessage
        };
      }
    };

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setIsLoading(true);

        const selectedFiles = Array.from(e.target.files || []);
        console.log('Selected files:', selectedFiles.length, 'files');
        console.log(
          'File types:',
          selectedFiles.map((f) => f.type)
        );
        console.log(
          'File sizes:',
          selectedFiles.map((f) => f.size)
        );
        console.log('Running on platform:', launchParams.tgWebAppPlatform);

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
        console.log('Valid files:', validFiles.length, 'files');

        if (validFiles.length === 0) {
          setIsLoading(false);
          return;
        }

        try {
          // First, add placeholder entries for the files being uploaded
          const placeholderFiles = validFiles.map(
            (file): MediaFile => ({
              file,
              preview: '', // Empty for now
              type: ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video',
              status: 'uploading',
              progress: 0
            })
          );

          // Add the placeholders to the display
          const updatedFilesWithPlaceholders = [
            ...mediaFiles,
            ...placeholderFiles
          ];
          onMediaFilesChange(updatedFilesWithPlaceholders);

          // Upload each file and get the updated MediaFile objects
          const uploadResults = await Promise.all(
            validFiles.map((file) => uploadFile(file))
          );

          // Replace the placeholders with the actual uploaded files
          const finalFiles = [...mediaFiles];

          // Find the index where placeholders start
          const startIndex = mediaFiles.length;

          // Replace each placeholder with its corresponding upload result
          uploadResults.forEach((result, index) => {
            finalFiles[startIndex + index] = result;
          });

          // Update state with the final files
          onMediaFilesChange(finalFiles);

          // Log any errors
          const errors = uploadResults
            .filter((result) => result.status === 'error')
            .map((result) => result.error);

          if (errors.length > 0) {
            setError(`Some files failed to upload: ${errors.join(', ')}`);
          }
        } catch (err) {
          console.error('Error during file upload process:', err);
          setError(
            `Failed to upload files: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        } finally {
          setIsLoading(false);

          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      [mediaFiles, onMediaFilesChange, launchParams.tgWebAppPlatform]
    );

    const handleRemoveFile = useCallback(
      (indexToRemove: number) => {
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
        console.log(
          'Triggering file input on platform:',
          launchParams.tgWebAppPlatform
        );
        try {
          fileInputRef.current.click();
        } catch (err) {
          console.error('Error triggering file input:', err);
          setError(
            `Could not open file picker: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      }
    };

    const handlePrevious = () => {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaFiles.length - 1));
    };

    const handleNext = () => {
      setActiveIndex((prev) => (prev < mediaFiles.length - 1 ? prev + 1 : 0));
    };

    // Handle drag and drop reordering
    const handleDragStart = (index: number, e: React.DragEvent) => {
      setDraggedIndex(index);

      // Set drag image (optional, for better visual feedback)
      if (e.dataTransfer && e.currentTarget) {
        // Create a semi-transparent clone of the element for dragging
        try {
          e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
        } catch (err) {
          console.log('Could not set drag image:', err);
        }
      }

      // Add data to the drag event
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
      }
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggedIndex === index) return;

      setDragOverIndex(index);

      // Change the cursor to indicate a drop is possible
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggedIndex === null || draggedIndex === index) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // Reorder the files
      const newFiles = [...mediaFiles];
      const [draggedItem] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(index, 0, draggedItem);
      onMediaFilesChange(newFiles);

      // Update active index if needed
      if (activeIndex === draggedIndex) {
        setActiveIndex(index);
      } else if (activeIndex > draggedIndex && activeIndex <= index) {
        setActiveIndex(activeIndex - 1);
      } else if (activeIndex < draggedIndex && activeIndex >= index) {
        setActiveIndex(activeIndex + 1);
      }

      // Reset drag state
      setDraggedIndex(null);
      setDragOverIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
      e.preventDefault();
      setDraggedIndex(null);
      setDragOverIndex(null);
    };

    const getStatusIndicator = (mediaFile: MediaFile) => {
      if (mediaFile.status === 'uploading') {
        return (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-sm font-medium">Uploading...</div>
            </div>
          </div>
        );
      }

      if (mediaFile.status === 'error') {
        return (
          <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <div className="text-lg mb-1">❌</div>
              <div className="text-sm font-medium">Upload Failed</div>
              {mediaFile.error && (
                <div className="text-xs mt-1 max-w-[200px] overflow-hidden text-ellipsis">
                  {mediaFile.error}
                </div>
              )}
            </div>
          </div>
        );
      }

      // For uploaded files, we don't need a status indicator
      return null;
    };

    const toggleView = () => {
      setShowGrid((prev) => !prev);
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

        {/* View toggle button */}
        {mediaFiles.length > 1 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleView}
              className="text-xs flex items-center gap-1"
            >
              {showGrid ? 'Carousel View' : 'Grid View'}
            </Button>
          </div>
        )}

        {/* Media preview - Grid View */}
        {mediaFiles.length > 0 && showGrid && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {mediaFiles.map((media, index) => {
              const hasPreview =
                media && media.preview && media.status === 'uploaded';

              return (
                <div
                  key={`media-grid-${index}`}
                  className={cn(
                    'relative aspect-square rounded-md overflow-hidden border cursor-move',
                    draggedIndex === index &&
                      'opacity-50 border-dashed border-2',
                    dragOverIndex === index && 'border-primary border-2',
                    !hasPreview && 'bg-muted'
                  )}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    setActiveIndex(index);
                    setShowGrid(false);
                  }}
                >
                  {/* File number indicator */}
                  <div className="absolute top-2 left-2 z-10 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>

                  {/* Drag handle */}
                  <div className="absolute top-2 right-10 z-10 text-white bg-black/30 rounded-full p-1">
                    <GripVertical className="h-4 w-4 cursor-move" />
                  </div>

                  {/* Media content */}
                  {hasPreview && media.type === 'image' ? (
                    <img
                      src={media.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLS40NDgtLTEtMS0xcy0xIC40NDgtMSAxIC40NDggMSAxIDEgMSAuNDQ4IDEgMXoiLz48L3N2Zz4=';
                      }}
                    />
                  ) : hasPreview && media.type === 'video' ? (
                    <video
                      src={media.preview}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                  ) : (
                    // Placeholder when no preview is available
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Status indicator overlay */}
                  {getStatusIndicator(media)}

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-background border shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    aria-label="Remove media"
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Drag instruction overlay - only visible on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="text-white text-sm font-medium">
                      Drag to reorder
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Media preview carousel - Single View */}
        {mediaFiles.length > 0 && !showGrid && (
          <div className="relative rounded-lg overflow-hidden bg-black/5">
            {/* Loading state */}
            {isLoading && (
              <Skeleton className="w-full aspect-square max-h-[400px]" />
            )}

            {/* Media display */}
            <div className={cn('relative', isLoading && 'hidden')}>
              {mediaFiles.map((media, index) => {
                const hasPreview =
                  media && media.preview && media.status === 'uploaded';

                return (
                  <div
                    key={`media-carousel-${index}`}
                    className={cn(
                      'w-full aspect-square max-h-[400px] flex items-center justify-center relative',
                      index !== activeIndex && 'hidden',
                      !hasPreview && 'bg-muted'
                    )}
                  >
                    {/* File number indicator */}
                    <div className="absolute top-2 left-2 z-10 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>

                    {/* Media content */}
                    {hasPreview && media.type === 'image' ? (
                      <img
                        src={media.preview}
                        alt={`Preview ${index + 1}`}
                        className="max-w-full max-h-[400px] object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLS40NDgtLTEtMS0xcy0xIC40NDgtMSAxIC40NDggMSAxIDEgMSAuNDQ4IDEgMXoiLz48L3N2Zz4=';
                        }}
                      />
                    ) : hasPreview && media.type === 'video' ? (
                      <video
                        src={media.preview}
                        className="max-w-full max-h-[400px] object-contain"
                        controls
                        playsInline
                      />
                    ) : (
                      // Placeholder when no preview is available
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
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
  }
);

MediaUpload.displayName = 'MediaUpload';
