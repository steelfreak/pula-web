import { create } from 'zustand';
import { Language } from '../types/api';

export interface LanguageState {
  languages: Language[];
  selectedSourceLanguage: Language | null;
  selectedTargetLanguage1: Language | null;
  selectedTargetLanguage2: Language | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setLanguages: (languages: Language[]) => void;
  setSelectedSourceLanguage: (language: Language | null) => void;
  setSelectedTargetLanguage1: (language: Language | null) => void;
  setSelectedTargetLanguage2: (language: Language | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  languages: [],
  selectedSourceLanguage: null,
  selectedTargetLanguage1: null,
  selectedTargetLanguage2: null,
  loading: false,
  error: null,

  setLanguages: (languages) => set({ languages }),
  setSelectedSourceLanguage: (language) => set({ selectedSourceLanguage: language }),
  setSelectedTargetLanguage1: (language) => set({ selectedTargetLanguage1: language }),
  setSelectedTargetLanguage2: (language) => set({ selectedTargetLanguage2: language }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    languages: [],
    selectedSourceLanguage: null,
    selectedTargetLanguage1: null,
    selectedTargetLanguage2: null,
    loading: false,
    error: null,
  }),
})); 