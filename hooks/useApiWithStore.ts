import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useLanguageStore, useLexemeStore } from '@/lib/stores';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  LexemeSearchRequest,
  LexemeDetailRequest,
  ApiError,
  AddLabeledTranslationRequest,
  AddAudioTranslationRequest,
  LoginResponse,
  OauthCallbackResponse,
} from '@/lib/types/api';

export const useApiWithStore = () => {
  const { toast } = useToast();
  const token = useAuthStore(state => state.token);
  
  // Use individual selectors to avoid object recreation
  const setLanguages = useLanguageStore(state => state.setLanguages);
  const setSelectedSourceLanguage = useLanguageStore(state => state.setSelectedSourceLanguage);
  const setSelectedTargetLanguage1 = useLanguageStore(state => state.setSelectedTargetLanguage1);
  const setSelectedTargetLanguage2 = useLanguageStore(state => state.setSelectedTargetLanguage2);
  const setLanguageLoading = useLanguageStore(state => state.setLoading);
  const setLanguageError = useLanguageStore(state => state.setError);
  
  const setLexemes = useLexemeStore(state => state.setLexemes);
  const setQuery = useLexemeStore(state => state.setQuery);
  const setSelectedLexeme = useLexemeStore(state => state.setSelectedLexeme);
  const setClickedLexeme = useLexemeStore(state => state.setClickedLexeme);
  const setLexemeLoading = useLexemeStore(state => state.setLoading);
  const setLexemeError = useLexemeStore(state => state.setError);

  const getLanguages = useCallback(async () => {
    api.setAuthToken(token);
    setLanguageLoading(true);
    setLanguageError(null);
    
    try {
      const languages = await api.getLanguages();
      setLanguages(languages);
      return languages;
    } catch (error) {
      const apiError = error as ApiError;
      setLanguageError(apiError.message);
      
      // Show toast notification for error
      toast({
        title: "Error loading languages",
        description: apiError.message,
        variant: "destructive",
      });
      
      throw apiError;
    } finally {
      setLanguageLoading(false);
    }
  }, [setLanguages, setLanguageLoading, setLanguageError, toast]);

  const searchLexemes = useCallback(async (request: LexemeSearchRequest) => {
    setLexemeLoading(true);
    setLexemeError(null);
    setQuery(request.search);
    
    try {
      const lexemes = await api.searchLexemes(request);
      setLexemes(lexemes);
      return lexemes;
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = typeof apiError.message === 'object' ? apiError.message.info : apiError.message;
      setLexemeError(errorMessage);
      
      // Show toast notification for error
      toast({
        title: "Error searching lexemes",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw apiError;
    } finally {
      setLexemeLoading(false);
    }
  }, [setLexemes, setQuery, setLexemeLoading, setLexemeError, toast]);

  const getLexemeDetails = useCallback(async () => {
    setLexemeLoading(true);
    setLexemeError(null);

    // Get required parameters from stores
    const clickedLexeme = useLexemeStore.getState().clickedLexeme;
    const selectedSourceLanguage = useLanguageStore.getState().selectedSourceLanguage;
    const selectedTargetLanguage1 = useLanguageStore.getState().selectedTargetLanguage1;
    const selectedTargetLanguage2 = useLanguageStore.getState().selectedTargetLanguage2;

    let request: LexemeDetailRequest = {
        id: clickedLexeme?.id || "",
        src_lang: selectedSourceLanguage?.lang_code || "",
        lang_1: selectedTargetLanguage1?.lang_code || "",
        lang_2: selectedTargetLanguage2?.lang_code || ""
    }
    
    // Construct request parameters
    
    
    try {
      const details = await api.getLexemeDetails(request);
      setSelectedLexeme(details);
      return details;
    } catch (error) {
      const apiError = error as ApiError;
      setLexemeError(apiError.message);
      
      // Show toast notification for error
      toast({
        title: "Error loading lexeme details",
        description: apiError.message,
        variant: "destructive",
      });
      
      throw apiError;
    } finally {
      setLexemeLoading(false);
    }
  }, [setSelectedLexeme, setLexemeLoading, setLexemeError, toast]);

  const addLabeledTranslation = useCallback(async (request: AddLabeledTranslationRequest) => {
    api.setAuthToken(token);
    setLexemeLoading(true);
    setLexemeError(null);

    try {
      const response = await api.addLabeledTranslation(request);
      console.log("response", response);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setLexemeError(apiError.message);
      throw apiError;
    } finally {
      setLexemeLoading(false);
    }
  }, [setLexemeError, setLexemeLoading, token]);

  const addAudioTranslation = useCallback(async (request: AddAudioTranslationRequest) => {
    api.setAuthToken(token);
    setLexemeLoading(true);
    setLexemeError(null);

    try {
      const response = await api.addAudioTranslation(request);
      console.log("response", response);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setLexemeError(apiError.message);
      throw apiError;
    } finally {
      setLexemeLoading(false);
    }
  }, [setLexemeError, token]);

  const login = useCallback(async () => {
    try {
      return await api.login();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Login failed",
        description: apiError.message,
        variant: "destructive",
      });
      throw apiError;
    }
  }, [toast]);

  const oauthCallback = useCallback(async (oauth_verifier: string, oauth_token: string) => {
    api.setAuthToken(token);
    try {
      return await api.oauthCallback(oauth_verifier, oauth_token);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "OAuth Callback failed",
        description: apiError.message,
        variant: "destructive",
      });
      throw apiError;
    }
  }, [toast, token]);

  const clearToken = useAuthStore(state => state.clearToken);

  const logout = useCallback(async () => {
    api.setAuthToken(token);
    try {
      await api.logout();
      clearToken();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Logout failed",
        description: apiError.message,
        variant: "destructive",
      });
      throw apiError;
    }
  }, [toast, token, clearToken]);

  return {
    addLabeledTranslation,
    addAudioTranslation,
    // Language store actions
    getLanguages,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    
    // Lexeme store actions
    searchLexemes,
    getLexemeDetails,
    setQuery,
    setClickedLexeme,
    
    // Auth actions
    login,
    oauthCallback,
    logout,
    
    // State from stores
    languages: useLanguageStore(state => state.languages),
    selectedSourceLanguage: useLanguageStore(state => state.selectedSourceLanguage),
    selectedTargetLanguage1: useLanguageStore(state => state.selectedTargetLanguage1),
    selectedTargetLanguage2: useLanguageStore(state => state.selectedTargetLanguage2),
    languageLoading: useLanguageStore(state => state.loading),
    languageError: useLanguageStore(state => state.error),
    
    lexemes: useLexemeStore(state => state.lexemes),
    query: useLexemeStore(state => state.query),
    selectedLexeme: useLexemeStore(state => state.selectedLexeme),
    clickedLexeme: useLexemeStore(state => state.clickedLexeme),
    lexemeLoading: useLexemeStore(state => state.loading),
    lexemeError: useLexemeStore(state => state.error),
    
    // Reset functions
    resetLanguageStore: useLanguageStore(state => state.reset),
    resetLexemeStore: useLexemeStore(state => state.reset),
  };
}; 