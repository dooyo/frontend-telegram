import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface ShareModalProps {
  postId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ postId, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const link = `https://t.me/dooyoappbot/app?startapp=post_${postId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Share Post</h2>
        <Button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2"
          variant={copied ? 'secondary' : 'default'}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
        <Button onClick={onClose} variant="ghost" className="w-full mt-2">
          Cancel
        </Button>
      </div>
    </div>
  );
};
