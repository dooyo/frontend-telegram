import axios, { AxiosError } from 'axios';
import { API_URL } from './config';

interface MetadataResponse {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface MetadataError {
  message: string;
  code:
    | 'INVALID_URL'
    | 'TIMEOUT'
    | 'RATE_LIMIT'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR';
}

export const fetchUrlMetadata = async (
  url: string
): Promise<MetadataResponse> => {
  try {
    // Create axios instance with base URL to ensure all requests go to the API server
    const axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 5000,
      headers: {
        Accept: 'application/json'
      }
    });

    const response = await axiosInstance.get<MetadataResponse>('/metadata', {
      params: { url }
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    let errorMessage: string;
    let errorCode: MetadataError['code'];

    switch (axiosError.response?.status) {
      case 400:
        errorMessage = 'Invalid URL provided';
        errorCode = 'INVALID_URL';
        break;
      case 408:
        errorMessage = 'Request timed out';
        errorCode = 'TIMEOUT';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later';
        errorCode = 'RATE_LIMIT';
        break;
      case 500:
        errorMessage = 'Server error while fetching URL metadata';
        errorCode = 'SERVER_ERROR';
        break;
      default:
        errorMessage = 'Network error while fetching URL metadata';
        errorCode = 'NETWORK_ERROR';
    }

    console.error('Error fetching URL metadata:', {
      url,
      error: errorMessage,
      code: errorCode,
      details: axiosError
    });

    // Return empty object as fallback, allowing the UI to still function
    return {};
  }
};
