import { create } from 'zustand';
import { LexemeSearchResult, LexemeDetailResult } from '../types/api';

interface LexemeState {
  lexemes: LexemeSearchResult[];
  query: string;
  selectedLexeme: LexemeDetailResult | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setLexemes: (lexemes: LexemeSearchResult[]) => void;
  setQuery: (query: string) => void;
  setSelectedLexeme: (lexeme: LexemeDetailResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLexemeStore = create<LexemeState>((set) => ({
  lexemes: [],
  query: "",
  selectedLexeme: null,
  loading: false,
  error: null,

  setLexemes: (lexemes) => set({ lexemes }),
  setQuery: (query) => set({ query }),
  setSelectedLexeme: (lexeme) => set({ selectedLexeme: lexeme }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    lexemes: [],
    query: "",
    selectedLexeme: null,
    loading: false,
    error: null,
  }),
})); 