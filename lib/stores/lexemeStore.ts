import { create } from 'zustand';
import { LexemeSearchResult, LexemeDetailResult } from '../types/api';
import { CLICKED_LEXEME, LIST_OF_LEXEMES, SELECTED_LEXEME } from '@/utils/constants';

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
  lexemes: localStorage.getItem(LIST_OF_LEXEMES) ? JSON.parse(localStorage.getItem(LIST_OF_LEXEMES) || '{}') : [],
  query: "",
  selectedLexeme: localStorage.getItem(SELECTED_LEXEME) ? JSON.parse(localStorage.getItem(SELECTED_LEXEME) || '{}') : null,
  clickedLexeme: localStorage.getItem(CLICKED_LEXEME) ? JSON.parse(localStorage.getItem(CLICKED_LEXEME) || '{}') : null,
  loading: false,
  error: null,

  setLexemes: (lexemes: any) => set({ lexemes }),
  setQuery: (query: string) => set({ query }),
  setSelectedLexeme: (lexeme: any) => set({ selectedLexeme: lexeme }),
  setClickedLexeme: (lexeme: any) => {
    set({ clickedLexeme: lexeme });
    localStorage.setItem(SELECTED_LEXEME, JSON.stringify(lexeme));
  },
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