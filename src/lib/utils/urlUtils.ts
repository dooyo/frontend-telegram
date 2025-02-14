import { z } from 'zod';
import { fetchUrlMetadata as fetchMetadata } from '@/lib/api/metadata';

const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;

export const mediaTypes = {
  IMAGE: ['jpg', 'jpeg', 'png', 'webp'] as string[],
  VIDEO: ['mp4', 'webm'] as string[],
  GIF: ['gif'] as string[]
} as const;

export type MediaType = 'IMAGE' | 'VIDEO' | 'GIF' | 'URL';

export interface UrlMetadata {
  url: string;
  type: MediaType;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export const urlMetadataSchema = z.object({
  url: z.string().url(),
  type: z.enum(['IMAGE', 'VIDEO', 'GIF', 'URL']),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  siteName: z.string().optional()
});

export const extractUrls = (text: string): string[] => {
  return text.match(urlRegex) || [];
};

export const getMediaType = (url: string): MediaType => {
  const extension = url.split('.').pop()?.toLowerCase();

  if (extension) {
    if (mediaTypes.IMAGE.includes(extension)) return 'IMAGE';
    if (mediaTypes.VIDEO.includes(extension)) return 'VIDEO';
    if (mediaTypes.GIF.includes(extension)) return 'GIF';
  }

  return 'URL';
};

export const fetchUrlMetadata = async (url: string): Promise<UrlMetadata> => {
  try {
    const mediaType = getMediaType(url);

    if (mediaType !== 'URL') {
      return {
        url,
        type: mediaType
      };
    }

    const data = await fetchMetadata(url);

    // Skip URLs with insufficient metadata
    const hasMinimalMetadata = data.description || (data.image && data.title);
    if (!hasMinimalMetadata) {
      return { url, type: 'URL' };
    }

    return urlMetadataSchema.parse({
      url,
      type: 'URL',
      ...data
    });
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return { url, type: 'URL' };
  }
};
