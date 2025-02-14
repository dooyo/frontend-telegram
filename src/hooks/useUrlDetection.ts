import { useState, useEffect, useCallback } from 'react';
import {
  extractUrls,
  fetchUrlMetadata,
  UrlMetadata
} from '@/lib/utils/urlUtils';
import { useDebouncedCallback } from 'use-debounce';

interface UseUrlDetectionResult {
  urls: UrlMetadata[];
  isLoading: boolean;
  error: string | null;
  retryFetch: () => void;
}

export const useUrlDetection = (text: string): UseUrlDetectionResult => {
  const [urls, setUrls] = useState<UrlMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlsToFetch, setUrlsToFetch] = useState<string[]>([]);

  const fetchMetadata = useCallback(async (urlsToProcess: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const uniqueUrls = Array.from(new Set(urlsToProcess));
      const metadataPromises = uniqueUrls.map(fetchUrlMetadata);
      const results = await Promise.all(metadataPromises);

      // Filter out empty results (failed fetches)
      const validResults = results.filter(
        (result) => Object.keys(result).length > 0
      );
      setUrls(validResults);

      if (validResults.length < uniqueUrls.length) {
        setError('Some URLs could not be previewed');
      }
    } catch (err) {
      setError('Failed to fetch URL metadata');
      console.error('Error fetching URL metadata:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchMetadata = useDebouncedCallback((urls: string[]) => {
    setUrlsToFetch(urls);
    fetchMetadata(urls);
  }, 500);

  useEffect(() => {
    const detectedUrls = extractUrls(text);

    if (detectedUrls.length > 0) {
      debouncedFetchMetadata(detectedUrls);
    } else {
      setUrls([]);
      setError(null);
    }
  }, [text, debouncedFetchMetadata]);

  const retryFetch = useCallback(() => {
    if (urlsToFetch.length > 0) {
      fetchMetadata(urlsToFetch);
    }
  }, [urlsToFetch, fetchMetadata]);

  return { urls, isLoading, error, retryFetch };
};
