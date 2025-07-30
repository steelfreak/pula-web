import { create } from 'zustand';
import { LexemeSearchResult, LexemeDetailResult } from '../types/api';

export interface LexemeState {
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

export const useLexemeStore = create<LexemeState>((set: any) => ({
  lexemes: [],
  query: "",
  selectedLexeme: null,
  clickedLexeme: null,
  loading: false,
  error: null,

  setLexemes: (lexemes: any) => set({ lexemes }),
  setQuery: (query: string) => set({ query }),
  setSelectedLexeme: (lexeme: any) => set({ selectedLexeme: lexeme }),
  setClickedLexeme: (lexeme: any) => set({ clickedLexeme: lexeme }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: any) => set({ error }),
  reset: () => set({
    lexemes: [],
    query: "",
    selectedLexeme: null,
    clickedLexeme: null,
    loading: false,
    error: null,
  }),
})); 