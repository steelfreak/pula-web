import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  Language,
  LexemeSearchRequest,
  LexemeSearchResult,
  LexemeDetailRequest,
  LexemeDetailResult,
  ApiError,
} from '@/lib/types/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export const useApi = () => {
  const [languagesState, setLanguagesState] = useState<ApiState<Language[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [searchState, setSearchState] = useState<ApiState<LexemeSearchResult[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [detailsState, setDetailsState] = useState<ApiState<LexemeDetailResult[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const getLanguages = useCallback(async () => {
    setLanguagesState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.getLanguages();
      setLanguagesState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setLanguagesState({ data: null, loading: false, error: apiError });
      throw apiError;
    }
  }, []);

  const searchLexemes = useCallback(async (request: LexemeSearchRequest) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.searchLexemes(request);
      setSearchState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setSearchState({ data: null, loading: false, error: apiError });
      throw apiError;
    }
  }, []);

  const getLexemeDetails = useCallback(async (request: LexemeDetailRequest) => {
    setDetailsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.getLexemeDetails(request);
      setDetailsState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setDetailsState({ data: null, loading: false, error: apiError });
      throw apiError;
    }
  }, []);

  return {
    // Languages
    languages: languagesState.data,
    languagesLoading: languagesState.loading,
    languagesError: languagesState.error,
    getLanguages,

    // Search
    searchResults: searchState.data,
    searchLoading: searchState.loading,
    searchError: searchState.error,
    searchLexemes,

    // Details
    lexemeDetails: detailsState.data,
    detailsLoading: detailsState.loading,
    detailsError: detailsState.error,
    getLexemeDetails,
  };
}; 