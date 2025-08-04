import { create } from 'zustand';
import { Language } from '../types/api';
import { SELECTED_SOURCE_LANGUAGE, SELECTED_TARGET_LANGUAGE1, SELECTED_TARGET_LANGUAGE2 } from '@/utils/constants';

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
  selectedSourceLanguage: localStorage.getItem(SELECTED_SOURCE_LANGUAGE) ? JSON.parse(localStorage.getItem(SELECTED_SOURCE_LANGUAGE) || '{}') : null,
  selectedTargetLanguage1: localStorage.getItem(SELECTED_TARGET_LANGUAGE1) ? JSON.parse(localStorage.getItem(SELECTED_TARGET_LANGUAGE1) || '{}') : null,
  selectedTargetLanguage2: localStorage.getItem(SELECTED_TARGET_LANGUAGE2) ? JSON.parse(localStorage.getItem(SELECTED_TARGET_LANGUAGE2) || '{}') : null,
  loading: false,
  error: null,

  setLanguages: (languages) => set({ languages }),
  setSelectedSourceLanguage: (language) => {
    set({ selectedSourceLanguage: language });
    localStorage.setItem(SELECTED_SOURCE_LANGUAGE, JSON.stringify(language));
  },
  setSelectedTargetLanguage1: (language) => {
    set({ selectedTargetLanguage1: language });
    localStorage.setItem(SELECTED_TARGET_LANGUAGE1, JSON.stringify(language));
  },
  setSelectedTargetLanguage2: (language) => {
    set({ selectedTargetLanguage2: language });
    localStorage.setItem(SELECTED_TARGET_LANGUAGE2, JSON.stringify(language));
  },
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