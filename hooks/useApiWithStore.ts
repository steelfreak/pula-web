import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useLanguageStore, useLexemeStore } from '@/lib/stores';
import { useToast } from '@/components/ui/use-toast';
import {
  LexemeSearchRequest,
  LexemeDetailRequest,
  ApiError,
} from '@/lib/types/api';

export const useApiWithStore = () => {
  const { toast } = useToast();
  
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
  const setLexemeLoading = useLexemeStore(state => state.setLoading);
  const setLexemeError = useLexemeStore(state => state.setError);

  const getLanguages = useCallback(async () => {
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
      setLexemeError(apiError.message);
      
      // Show toast notification for error
      toast({
        title: "Error searching lexemes",
        description: apiError.message,
        variant: "destructive",
      });
      
      throw apiError;
    } finally {
      setLexemeLoading(false);
    }
  }, [setLexemes, setQuery, setLexemeLoading, setLexemeError, toast]);

  const getLexemeDetails = useCallback(async (request: LexemeDetailRequest) => {
    setLexemeLoading(true);
    setLexemeError(null);
    
    try {
      const details = await api.getLexemeDetails(request);
      // Since the API returns an array, we'll take the first result
      const selectedLexeme = details.length > 0 ? details[0] : null;
      setSelectedLexeme(selectedLexeme);
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

  return {
    // Language store actions
    getLanguages,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    
    // Lexeme store actions
    searchLexemes,
    getLexemeDetails,
    setQuery,
    
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
    lexemeLoading: useLexemeStore(state => state.loading),
    lexemeError: useLexemeStore(state => state.error),
    
    // Reset functions
    resetLanguageStore: useLanguageStore(state => state.reset),
    resetLexemeStore: useLexemeStore(state => state.reset),
  };
}; 