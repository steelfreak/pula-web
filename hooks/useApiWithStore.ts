import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useLanguageStore, useLexemeStore } from '@/lib/stores';
import {
  LexemeSearchRequest,
  LexemeDetailRequest,
  ApiError,
} from '@/lib/types/api';

export const useApiWithStore = () => {
  const languageStore = useLanguageStore();
  const lexemeStore = useLexemeStore();

  const getLanguages = useCallback(async () => {
    languageStore.setLoading(true);
    languageStore.setError(null);
    
    try {
      const languages = await api.getLanguages();
      languageStore.setLanguages(languages);
      return languages;
    } catch (error) {
      const apiError = error as ApiError;
      languageStore.setError(apiError.message);
      throw apiError;
    } finally {
      languageStore.setLoading(false);
    }
  }, [languageStore]);

  const searchLexemes = useCallback(async (request: LexemeSearchRequest) => {
    lexemeStore.setLoading(true);
    lexemeStore.setError(null);
    lexemeStore.setQuery(request.search);
    
    try {
      const lexemes = await api.searchLexemes(request);
      lexemeStore.setLexemes(lexemes);
      return lexemes;
    } catch (error) {
      const apiError = error as ApiError;
      lexemeStore.setError(apiError.message);
      throw apiError;
    } finally {
      lexemeStore.setLoading(false);
    }
  }, [lexemeStore]);

  const getLexemeDetails = useCallback(async (request: LexemeDetailRequest) => {
    lexemeStore.setLoading(true);
    lexemeStore.setError(null);
    
    try {
      const details = await api.getLexemeDetails(request);
      // Since the API returns an array, we'll take the first result
      const selectedLexeme = details.length > 0 ? details[0] : null;
      lexemeStore.setSelectedLexeme(selectedLexeme);
      return details;
    } catch (error) {
      const apiError = error as ApiError;
      lexemeStore.setError(apiError.message);
      throw apiError;
    } finally {
      lexemeStore.setLoading(false);
    }
  }, [lexemeStore]);

  return {
    // Language store actions
    getLanguages,
    setSelectedBaseLanguage: languageStore.setSelectedBaseLanguage,
    setSelectedTargetLanguage1: languageStore.setSelectedTargetLanguage1,
    setSelectedTargetLanguage2: languageStore.setSelectedTargetLanguage2,
    
    // Lexeme store actions
    searchLexemes,
    getLexemeDetails,
    setQuery: lexemeStore.setQuery,
    
    // State from stores
    languages: languageStore.languages,
    selectedBaseLanguage: languageStore.selectedBaseLanguage,
    selectedTargetLanguage1: languageStore.selectedTargetLanguage1,
    selectedTargetLanguage2: languageStore.selectedTargetLanguage2,
    languageLoading: languageStore.loading,
    languageError: languageStore.error,
    
    lexemes: lexemeStore.lexemes,
    query: lexemeStore.query,
    selectedLexeme: lexemeStore.selectedLexeme,
    lexemeLoading: lexemeStore.loading,
    lexemeError: lexemeStore.error,
    
    // Reset functions
    resetLanguageStore: languageStore.reset,
    resetLexemeStore: lexemeStore.reset,
  };
}; 