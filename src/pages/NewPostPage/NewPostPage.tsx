import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/lib/api/posts';
import { getMe } from '@/lib/api/profiles';
import { UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Avatar } from 'files-ui-react-19';
import { cn } from '@/lib/utils/cn';
import { MentionsInput } from '@/components/ui/mentions-input';
import { LimitsDisplay } from '@/components/LimitsDisplay/LimitsDisplay';
import { useLimits } from '@/context/LimitsContext';
import { MediaPreview } from '@/components/MediaPreview/MediaPreview';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import { MediaUpload, MediaFile } from '@/components/MediaUpload/MediaUpload';

const MAX_CHARS = 280;

export const NewPostPage: React.FC = () => {
  const [text, setText] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const mediaUploadRef = useRef<{
    uploadAllPendingFiles: () => Promise<string[]>;
  }>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { urls } = useUrlDetection(text);

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      refreshLimits();
    }
  });

  const { data: me, isLoading } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: getMe
  });

  const { limits, refreshLimits } = useLimits();
  const isAtLimit = limits?.posts.remaining === 0;

  const handleTextChange = useCallback((newText: string) => {
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  }, []);

  const handleMentionsChange = useCallback((users: string[]) => {
    setMentionedUserIds(users);
  }, []);

  const handleRemoveUrl = useCallback((urlToRemove: string) => {
    setText((currentText) => {
      // Create a regex that matches the URL with optional surrounding whitespace
      const urlRegex = new RegExp(
        `\\s*${urlToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`
      );
      return currentText.replace(urlRegex, ' ').trim();
    });
  }, []);

  const handlePost = async () => {
    if (!text.trim() && mediaFiles.length === 0) return;

    try {
      setIsUploading(true);

      // Upload any pending media files
      let mediaIds: string[] = [];

      if (mediaFiles.some((file) => file.status === 'pending')) {
        console.log('Uploading pending files before posting');
        console.log(
          'Media files status:',
          mediaFiles.map((f) => ({
            status: f.status,
            type: f.type,
            id: f.id,
            hasFile: !!f.file,
            hasPreview: !!f.preview,
            fileName: f.file?.name
          }))
        );

        try {
          const uploadedIds =
            await mediaUploadRef.current?.uploadAllPendingFiles();
          console.log('Upload complete, received IDs:', uploadedIds);
          if (uploadedIds && uploadedIds.length > 0) {
            mediaIds = [...mediaIds, ...uploadedIds];
          }
        } catch (error) {
          console.error('Error uploading files:', error);
          setIsUploading(false);
          return;
        }
      } else {
        // If there are already uploaded files, collect their IDs
        mediaIds = mediaFiles
          .filter((file) => file.status === 'uploaded' && file.id)
          .map((file) => file.id as string);
        console.log('Using existing uploaded media IDs:', mediaIds);
      }

      // Create the post with the uploaded media IDs
      await mutateAsync({
        text,
        mentionedUserIds,
        mediaIds
      });

      // Reset state
      setText('');
      setMentionedUserIds([]);
      setMediaFiles([]);
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  const charsLeft = MAX_CHARS - text.length;
  const isNearLimit = charsLeft <= 20;
  const hasContent = text.trim().length > 0 || mediaFiles.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] via-[#FDE1D3] to-[#FEC6A1]">
      <Container className="w-full max-w-3xl px-4 py-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-6 text-foreground">
          Create New Post
        </h1>

        {/* Main content area */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex gap-4">
            <Avatar
              src={me?.avatarUrl?.replace('localhost', '10.100.102.18')}
              alt={me?.username || 'User Avatar'}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#DFDAD6',
                border: '1px solid #CBC3BE',
                borderRadius: '50%'
              }}
              variant="circle"
              readOnly
            />
            <div className="flex-1 space-y-4">
              <MentionsInput
                value={text}
                onChange={handleTextChange}
                onMentionsChange={handleMentionsChange}
                placeholder={`What's on your mind?`}
                maxLength={MAX_CHARS}
                rows={6}
                className={cn(
                  'w-full rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground resize-none text-base',
                  'focus:outline-none',
                  isAtLimit && 'opacity-50 cursor-not-allowed'
                )}
                disabled={isAtLimit}
              />

              <div className="space-y-4">
                <MediaUpload
                  mediaFiles={mediaFiles}
                  onMediaFilesChange={setMediaFiles}
                  className="mt-4"
                  disabled={isAtLimit || isUploading}
                  ref={mediaUploadRef}
                />
              </div>

              {urls.length > 0 && (
                <div className="space-y-2">
                  {urls
                    .filter(
                      (metadata) =>
                        metadata.type !== 'URL' ||
                        metadata.description ||
                        (metadata.image && metadata.title)
                    )
                    .map((metadata, index) => (
                      <MediaPreview
                        key={`${metadata.url}-${index}`}
                        metadata={metadata}
                        onRemove={() => handleRemoveUrl(metadata.url)}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-destructive text-center mt-4">
              Error: {(error as Error).message}
            </div>
          )}
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="fixed bottom-[56px] left-0 right-0 glass-card border-t border-white/20">
        <div className="max-w-3xl mx-auto p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span
              className={cn(
                'text-sm transition-colors',
                isNearLimit ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {charsLeft} characters left
            </span>
            <Button
              onClick={handlePost}
              disabled={
                isPending ||
                !hasContent ||
                text.length > MAX_CHARS ||
                isAtLimit ||
                isUploading
              }
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8"
            >
              {isPending ? 'Posting...' : isUploading ? 'Uploading...' : 'Post'}
            </Button>
          </div>
          <LimitsDisplay type="posts" showUpgradeButton={isAtLimit} />
        </div>
      </div>
    </div>
  );
};
