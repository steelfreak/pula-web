import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Language,
  LexemeSearchRequest,
  LexemeSearchResult,
  LexemeDetailRequest,
  LexemeDetailResult,
  ApiError,
  AddLabeledTranslationRequest,
  AddAudioTranslationRequest,
  LoginResponse,
  OauthCallbackResponse,
  LexemeMissingAudioResquest,
  LexemeMissingAudioResponse,
} from './types/api';
import { TOKEN_KEY } from './stores/authStore';
import { checkIf401Error } from './utils';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agpb-server-v1.toolforge.org/api';

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
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
              // localStorage.removeItem(TOKEN_KEY);
              // window.location.href = '/';
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

  // Set token for authenticated requests
  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['x-access-tokens'] = token;
    } else {
      delete this.client.defaults.headers.common['x-access-tokens'];
    }
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
  async getLexemeDetails(request: LexemeDetailRequest): Promise<LexemeDetailResult> {
    try {
      const response: AxiosResponse<LexemeDetailResult> = await this.client.post(`/lexemes/${request.id}/translations`, request);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Add a labeled translation for a lexeme
   */
  async addLabeledTranslation(request: AddLabeledTranslationRequest[]): Promise<void> {
    try {
      await this.client.post('/lexemes/translations/add', request);
    } catch (error) {
      checkIf401Error(error as ApiError);
      throw error as ApiError;
    }
  }

  /**
   * Add an audio translation for a lexeme
   */
  async addAudioTranslation(request: AddAudioTranslationRequest[]): Promise<void> {
    try {
      await this.client.post('/lexeme/audio/add', { request });
    } catch (error) {
      checkIf401Error(error as ApiError);
      throw error as ApiError;
    }
  }

  /**
   * Login: Get redirect string for OAuth
   */
  async login(): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.client.get('/auth/login');
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * OAuth callback: Exchange verifier/token for app token
   */
  async oauthCallback(oauth_verifier: string, oauth_token: string): Promise<OauthCallbackResponse> {
    try {
      const response: AxiosResponse<OauthCallbackResponse> = await this.client.get(`/oauth-callback?oauth_verifier=${encodeURIComponent(oauth_verifier)}&oauth_token=${encodeURIComponent(oauth_token)}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Logout: Invalidate the session on the backend
   */
  async logout(): Promise<void> {
    try {
      await this.client.get('/auth/logout');
    } catch (error) {
      checkIf401Error(error as ApiError);
      throw error as ApiError;
    }
  }

  /**
   * Get list of lexemes missing audio for a language
   */
  async getLexemeMissingAudio(request: LexemeMissingAudioResquest): Promise<LexemeMissingAudioResponse> {
    try {
      const response: AxiosResponse<LexemeMissingAudioResponse> = await this.client.post('/lexemes/missing/audio', request);
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
  addLabeledTranslation: (request: AddLabeledTranslationRequest[]) => apiClient.addLabeledTranslation(request),
  addAudioTranslation: (request: AddAudioTranslationRequest[]) => apiClient.addAudioTranslation(request),
  login: () => apiClient.login(),
  oauthCallback: (oauth_verifier: string, oauth_token: string) => apiClient.oauthCallback(oauth_verifier, oauth_token),
  logout: () => apiClient.logout(),
  setAuthToken: (token: string | null) => apiClient.setAuthToken(token),
  getLexemeMissingAudio:(request: LexemeMissingAudioResquest) => apiClient.getLexemeMissingAudio(request),
};

export default apiClient;