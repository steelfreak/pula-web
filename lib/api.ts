import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Language,
  LexemeSearchRequest,
  LexemeSearchResult,
  LexemeDetailRequest,
  LexemeDetailResult,
  ApiError,
} from './types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api';
    
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status,
        };
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Get list of available languages
   */
  async getLanguages(): Promise<Language[]> {
    try {
      const response: AxiosResponse<Language[]> = await this.client.get('/languages');
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Search for lexemes in a base language
   */
  async searchLexemes(request: LexemeSearchRequest): Promise<LexemeSearchResult[]> {
    try {
      const response: AxiosResponse<LexemeSearchResult[]> = await this.client.post('/lexemes', request);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Get detailed lexeme information with glosses in multiple languages
   */
  async getLexemeDetails(request: LexemeDetailRequest): Promise<LexemeDetailResult[]> {
    try {
      const response: AxiosResponse<LexemeDetailResult[]> = await this.client.post(`/lexemes/${request.id}`, request);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const api = {
  getLanguages: () => apiClient.getLanguages(),
  searchLexemes: (request: LexemeSearchRequest) => apiClient.searchLexemes(request),
  getLexemeDetails: (request: LexemeDetailRequest) => apiClient.getLexemeDetails(request),
};

export default apiClient; 