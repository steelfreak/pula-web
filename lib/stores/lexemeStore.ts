import { create } from 'zustand';
import { LexemeSearchResult, LexemeDetailResult } from '../types/api';

interface LexemeState {
  lexemes: LexemeSearchResult[];
  query: string;
  selectedLexeme: LexemeDetailResult | null;
  clickedLexeme: LexemeSearchResult | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setLexemes: (lexemes: LexemeSearchResult[]) => void;
  setQuery: (query: string) => void;
  setSelectedLexeme: (lexeme: LexemeDetailResult | null) => void;
  setClickedLexeme: (lexeme: LexemeSearchResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLexemeStore = create<LexemeState>((set) => ({
  lexemes: [],
  query: "",
  selectedLexeme: null,
  clickedLexeme: null,
  loading: false,
  error: null,

  setLexemes: (lexemes) => set({ lexemes }),
  setQuery: (query) => set({ query }),
  setSelectedLexeme: (lexeme) => set({ selectedLexeme: lexeme }),
  setClickedLexeme: (lexeme) => set({ clickedLexeme: lexeme }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    lexemes: [],
    query: "",
    selectedLexeme: null,
    clickedLexeme: null,
    loading: false,
    error: null,
  }),
})); 