import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useLanguageStore, useLexemeStore } from "@/lib/stores";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  LexemeSearchRequest,
  LexemeDetailRequest,
  ApiError,
  AddDescriptionRequest,
  AddAudioTranslationRequest,
  LexemeMissingAudioResquest,
  AddTranslationRequest,
} from "@/lib/types/api";
// Import store state types
import type { LanguageState } from "@/lib/stores/languageStore";
import type { LexemeState } from "@/lib/stores/lexemeStore";
import type { AuthState } from "@/lib/stores/authStore";
import {
  LIST_OF_LANGUAGES,
  LIST_OF_LEXEMES,
  SELECTED_LEXEME,
  SELECTED_LEXEME_TRANSLATIONS,
} from "@/utils/constants";

export const useApiWithStore = () => {
  const { toast } = useToast();
  const token = useAuthStore((state: AuthState) => state.token);
  const hydrateAuth = useAuthStore((state: AuthState) => state.hydrate);
  const hydrateLanguage = useLanguageStore(
    (state: LanguageState) => state.hydrate
  );
  const hydrateLexeme = useLexemeStore((state: LexemeState) => state.hydrate);

  // Hydrate all stores on mount
  useEffect(() => {
    hydrateAuth();
    hydrateLanguage();
    hydrateLexeme();
  }, [hydrateAuth, hydrateLanguage, hydrateLexeme]);

  // Use individual selectors to avoid object recreation
  const setLanguages = useLanguageStore(
    (state: LanguageState) => state.setLanguages
  );
  const setSelectedSourceLanguage = useLanguageStore(
    (state: LanguageState) => state.setSelectedSourceLanguage
  );
  const setSelectedTargetLanguage1 = useLanguageStore(
    (state: LanguageState) => state.setSelectedTargetLanguage1
  );
  const setSelectedTargetLanguage2 = useLanguageStore(
    (state: LanguageState) => state.setSelectedTargetLanguage2
  );
  const setLanguageLoading = useLanguageStore(
    (state: LanguageState) => state.setLoading
  );
  const setLanguageError = useLanguageStore(
    (state: LanguageState) => state.setError
  );

  const setLexemes = useLexemeStore((state: LexemeState) => state.setLexemes);
  const setQuery = useLexemeStore((state: LexemeState) => state.setQuery);
  const setSelectedLexeme = useLexemeStore(
    (state: LexemeState) => state.setSelectedLexeme
  );
  const setClickedLexeme = useLexemeStore(
    (state: LexemeState) => state.setClickedLexeme
  );
  const setLexemeLoading = useLexemeStore(
    (state: LexemeState) => state.setLoading
  );
  const setLexemeError = useLexemeStore((state: LexemeState) => state.setError);
  const setLexemeTranslations = useLexemeStore(
    (state: LexemeState) => state.setLexemeTranslations
  );

  /**
   * Get the list of languages from the API and store it in the store and local storage
   */
  const getLanguages = useCallback(async () => {
    api.setAuthToken(token);
    setLanguageLoading(true);
    setLanguageError(null);

    try {
      const languages = await api.getLanguages();
      setLanguages(languages);
      if (typeof window !== "undefined") {
        localStorage.setItem(LIST_OF_LANGUAGES, JSON.stringify(languages));
      }
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
  }, [setLanguages, setLanguageLoading, setLanguageError, toast, token]);

  /**
   * Search for lexemes and store them in the store and local storage
   */
  const searchLexemes = useCallback(
    async (request: LexemeSearchRequest) => {
      setLexemeLoading(true);
      setLexemeError(null);
      setQuery(request.search);

      if (!request.search || !request.src_lang) {
        return;
      }

      try {
        const lexemes = await api.searchLexemes(request);
        setLexemes(lexemes);
        if (typeof window !== "undefined") {
          localStorage.setItem(LIST_OF_LEXEMES, JSON.stringify(lexemes));
        }
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
    },
    [setLexemes, setQuery, setLexemeLoading, setLexemeError, toast]
  );

  /**
   * Get the details of a lexeme and store it in the store and local storage
   */
  const getLexemeDetails = useCallback(async () => {
    setLexemeLoading(true);
    setLexemeError(null);

    // Get required parameters from stores
    const clickedLexeme = useLexemeStore.getState().clickedLexeme;
    const selectedSourceLanguage =
      useLanguageStore.getState().selectedSourceLanguage;
    const selectedTargetLanguage1 =
      useLanguageStore.getState().selectedTargetLanguage1;
    const selectedTargetLanguage2 =
      useLanguageStore.getState().selectedTargetLanguage2;

    if (
      !clickedLexeme ||
      !selectedSourceLanguage ||
      !selectedTargetLanguage1 ||
      !selectedTargetLanguage2
    ) {
      return;
    }

    let request: LexemeDetailRequest = {
      id: clickedLexeme?.id || "",
      src_lang: selectedSourceLanguage?.lang_code || "",
      lang_1: selectedTargetLanguage1?.lang_code || "",
      lang_2: selectedTargetLanguage2?.lang_code || "",
    };

    // Construct request parameters

    try {
      const details = await api.getLexemeDetails(request);
      if (typeof window !== "undefined") {
        localStorage.setItem(SELECTED_LEXEME, JSON.stringify(details));
      }
      setSelectedLexeme(details);
      return details;
    } catch (error) {
      const apiError = error as ApiError;
      setLexemeError(apiError.message);
      setSelectedLexeme(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(SELECTED_LEXEME);
      }

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

  /**
   * Get the translations of a lexeme and store it in the store and local storage
   */
  const getLexemeTranslations = useCallback(async () => {
    setLexemeLoading(true);
    setLexemeError(null);

    // Get required parameters from stores
    const clickedLexeme = useLexemeStore.getState().clickedLexeme;
    const selectedSourceLanguage =
      useLanguageStore.getState().selectedSourceLanguage;
    const selectedTargetLanguage1 =
      useLanguageStore.getState().selectedTargetLanguage1;
    const selectedTargetLanguage2 =
      useLanguageStore.getState().selectedTargetLanguage2;

    if (
      !clickedLexeme ||
      !selectedSourceLanguage ||
      !selectedTargetLanguage1 ||
      !selectedTargetLanguage2
    ) {
      return;
    }

    let request: LexemeDetailRequest = {
      id: clickedLexeme?.id || "",
      src_lang: selectedSourceLanguage?.lang_code || "",
      lang_1: selectedTargetLanguage1?.lang_code || "",
      lang_2: selectedTargetLanguage2?.lang_code || "",
    };

    try {
      const translations = await api.getLexemeTranslations(request);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          SELECTED_LEXEME_TRANSLATIONS,
          JSON.stringify(translations)
        );
      }
      setLexemeTranslations(translations);
      return translations;
    } catch (error) {
      const apiError = error as ApiError;
      setLexemeError(apiError.message);
      setLexemeTranslations(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(SELECTED_LEXEME_TRANSLATIONS);
      }

      // Show toast notification for error
      toast({
        title: "Error loading lexeme translations",
        description: apiError.message,
        variant: "destructive",
      });

      throw apiError;
    } finally {
      setLexemeLoading(false);
    }
  }, [setLexemeLoading, setLexemeError, toast]);

  /**
   * Add a labeled translation to a lexeme and store it in the store and local storage
   */
  const addDescription = useCallback(
    async (request: AddDescriptionRequest[]) => {
      api.setAuthToken(token);
      setLexemeLoading(true);
      setLexemeError(null);

      try {
        const response = await api.addDescription(request);
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setLexemeError(apiError.message);
        throw apiError;
      } finally {
        setLexemeLoading(false);
      }
    },
    [setLexemeError, setLexemeLoading, token]
  );

  /**
   * Add a labeled translation to a lexeme and store it in the store and local storage
   */
  const addTranslation = useCallback(
    async (request: AddTranslationRequest[]) => {
      api.setAuthToken(token);
      setLexemeLoading(true);
      setLexemeError(null);

      try {
        const response = await api.addTranslation(request);
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setLexemeError(apiError.message);
        throw apiError;
      } finally {
        setLexemeLoading(false);
      }
    },
    [setLexemeError, setLexemeLoading, token]
  );

  /**
   * Add an audio translation to a lexeme and store it in the store and local storage
   */
  const addAudioTranslation = useCallback(
    async (request: AddAudioTranslationRequest[]) => {
      api.setAuthToken(token);
      setLexemeLoading(true);
      setLexemeError(null);

      try {
        const response = await api.addAudioTranslation(request);
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setLexemeError(apiError.message);
        throw apiError;
      } finally {
        setLexemeLoading(false);
      }
    },
    [setLexemeError, token]
  );

  /**
   * Get the missing audio lexemes and store it in the store and local storage
   */
  const getLexemeMissingAudio = useCallback(
    async (request: LexemeMissingAudioResquest) => {
      setLexemeLoading(true);
      setLexemeError(null);
      try {
        const result = await api.getLexemeMissingAudio(request);
        // You may want to store this in a dedicated store if needed
        return result;
      } catch (error) {
        const apiError = error as ApiError;
        setLexemeError(apiError.message);
        toast({
          title: "Error loading missing audio lexemes",
          description: apiError.message,
          variant: "destructive",
        });
        throw apiError;
      } finally {
        setLexemeLoading(false);
      }
    },
    [setLexemeLoading, setLexemeError, toast]
  );

  /**
   * Login to the API and store the token in the store and local storage
   */
  const login = useCallback(async () => {
    try {
      return await api.login();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Login failed",
        description: apiError.message,
        variant: "destructive",
      });
      throw apiError;
    }
  }, [toast]);

  const setUsername = useAuthStore((state: AuthState) => state.setUsername);
  const setToken = useAuthStore((state: AuthState) => state.setToken);

  const oauthCallback = useCallback(
    async (oauth_verifier: string, oauth_token: string) => {
      api.setAuthToken(token);
      try {
        const response = await api.oauthCallback(oauth_verifier, oauth_token);
        if (response.token) {
          setToken(response.token);
          setUsername(response.username);
        }
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        // toast({
        //   title: "OAuth Callback failed",
        //   description: apiError.message,
        //   variant: "destructive",
        // });
        throw apiError;
      }
    },
    [toast, token, setUsername, setToken]
  );

  /**
   * Clear the token in the store and local storage
   */
  const clearToken = useAuthStore((state) => state.clearToken);
  const clearUsername = useAuthStore((state) => state.clearUsername);
  const clearPrefLangs = useAuthStore((state) => state.clearPrefLangs);

  /**
   * Clear the username in the store and local storage
   */
  const logout = useCallback(async () => {
    api.setAuthToken(token);
    try {
      await api.logout(token || "");
      clearToken();
      clearUsername();
      clearPrefLangs();
    } catch (error) {
      // const apiError = error as ApiError;
      // toast({
      //   title: "Logout failed",
      //   description: apiError.message,
      //   variant: "destructive",
      // });
      // throw apiError;
      clearToken();
      clearUsername();
      clearPrefLangs();
    }
  }, [toast, token, clearToken, clearUsername, clearPrefLangs]);

  return {
    addDescription,
    addTranslation,
    addAudioTranslation,
    // Language store actions
    getLanguages,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,

    // Lexeme store actions
    searchLexemes,
    getLexemeDetails,
    getLexemeTranslations,
    getLexemeMissingAudio,
    setQuery,
    setClickedLexeme,

    // Auth actions
    login,
    oauthCallback,
    logout,

    // State from stores
    languages: useLanguageStore((state: LanguageState) => state.languages),
    selectedSourceLanguage: useLanguageStore(
      (state: LanguageState) => state.selectedSourceLanguage
    ),
    selectedTargetLanguage1: useLanguageStore(
      (state: LanguageState) => state.selectedTargetLanguage1
    ),
    selectedTargetLanguage2: useLanguageStore(
      (state: LanguageState) => state.selectedTargetLanguage2
    ),
    languageLoading: useLanguageStore((state: LanguageState) => state.loading),
    languageError: useLanguageStore((state: LanguageState) => state.error),

    lexemes: useLexemeStore((state: LexemeState) => state.lexemes),
    query: useLexemeStore((state: LexemeState) => state.query),
    selectedLexeme: useLexemeStore(
      (state: LexemeState) => state.selectedLexeme
    ),
    clickedLexeme: useLexemeStore((state: LexemeState) => state.clickedLexeme),
    lexemeLoading: useLexemeStore((state: LexemeState) => state.loading),
    lexemeError: useLexemeStore((state: LexemeState) => state.error),
    lexemeTranslations: useLexemeStore(
      (state: LexemeState) => state.lexemeTranslations
    ),
    // Reset functions
    resetLanguageStore: useLanguageStore((state: LanguageState) => state.reset),
    resetLexemeStore: useLexemeStore((state: LexemeState) => state.reset),
  };
};
