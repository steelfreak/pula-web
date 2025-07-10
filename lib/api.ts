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
        let errorMessage = 'An error occurred';
        let status = error.response?.status;
        console.log(error);
        // Handle different types of errors
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your connection.';
          status = 0;
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout: The server took too long to respond.';
          status = 408;
        } else if (error.response?.status === 0) {
          errorMessage = 'CORS error: The server is blocking requests. Please check server configuration.';
          status = 0;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          status = error.response.status;
        } else if (error.response?.status) {
          // Handle HTTP status codes
          switch (error.response.status) {
            case 400:
              errorMessage = 'Bad request: Invalid data sent to server.';
              break;
            case 401:
              errorMessage = 'Unauthorized: Please check your credentials.';
              break;
            case 403:
              errorMessage = 'Forbidden: Access denied.';
              break;
            case 404:
              errorMessage = 'Not found: The requested resource was not found.';
              break;
            case 500:
              errorMessage = 'Server error: Internal server error occurred.';
              break;
            case 502:
              errorMessage = 'Bad gateway: Server is temporarily unavailable.';
              break;
            case 503:
              errorMessage = 'Service unavailable: Server is temporarily down.';
              break;
            default:
              errorMessage = `HTTP ${error.response.status}: ${error.response.statusText || 'Unknown error'}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: status,
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