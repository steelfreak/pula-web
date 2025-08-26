import { create } from 'zustand';
import { LexemeSearchResult, LexemeDetailResult, LexemeTranslation } from '../types/api';
import { CLICKED_LEXEME, LIST_OF_LEXEMES, SELECTED_LEXEME } from '@/utils/constants';

export interface LexemeState {
  lexemes: LexemeSearchResult[];
  query: string;
  selectedLexeme: LexemeDetailResult | null;
  clickedLexeme: LexemeSearchResult | null;
  lexemeTranslations: LexemeTranslation[] | null;
  loading: boolean;
  error: string | null;

  // Actions
  setLexemes: (lexemes: LexemeSearchResult[]) => void;
  setQuery: (query: string) => void;
  setSelectedLexeme: (lexeme: LexemeDetailResult | null) => void;
  setClickedLexeme: (lexeme: LexemeSearchResult | null) => void;
  setLexemeTranslations: (translations: LexemeTranslation[] | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  hydrate: () => void;
}

export const useLexemeStore = create<LexemeState>((set: any) => ({
  lexemes: [],
  query: "",
  selectedLexeme: null,
  clickedLexeme: null,
  lexemeTranslations: null,
  loading: false,
  error: null,

  setLexemes: (lexemes: any) => set({ lexemes }),
  setQuery: (query: string) => set({ query }),
  setSelectedLexeme: (lexeme: any) => set({ selectedLexeme: lexeme }),
  setClickedLexeme: (lexeme: any) => {
    set({ clickedLexeme: lexeme });
    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_LEXEME, JSON.stringify(lexeme));
    }
  },
  setLexemeTranslations: (translations: LexemeTranslation[] | null) => set({ lexemeTranslations: translations }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: any) => set({ error }),
  reset: () => set({
    lexemes: [],
    query: "",
    selectedLexeme: null,
    clickedLexeme: null,
    lexemeTranslations: null,
    loading: false,
    error: null,
  }),
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const storedLexemes = localStorage.getItem(LIST_OF_LEXEMES);
      const storedSelected = localStorage.getItem(SELECTED_LEXEME);
      const storedClicked = localStorage.getItem(CLICKED_LEXEME);
      
      if (storedLexemes) {
        set({ lexemes: JSON.parse(storedLexemes) });
      }
      if (storedSelected) {
        set({ selectedLexeme: JSON.parse(storedSelected) });
      }
      if (storedClicked) {
        set({ clickedLexeme: JSON.parse(storedClicked) });
      }
    }
  },
})); 