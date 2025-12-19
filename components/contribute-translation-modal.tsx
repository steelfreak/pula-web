"use client";

/**
 * Modal component for contributing translations by searching existing lexemes or creating new ones.
 * Users can search for matching lexemes in the target language and select a sense, or create a new translation.
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip-info";
import {
  AddTranslationRequest,
  Language,
  LexemeSearchRequest,
  LexemeSearchResult,
  LexemeTranslation,
} from "@/lib/types/api";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { api } from "@/lib/api";
import Spinner from "./spinner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ContributeModalProps {
  /** Whether the modal is currently open */
  open: boolean;
  /** Callback to control modal open/close state */
  onOpenChange: (open: boolean) => void;
  /** Target language for the translation */
  language: Language | null;
  /** Optional callback triggered on successful submission */
  onSuccess?: () => void;
  /** Existing translations for the base lexeme */
  lexemeTranslations: LexemeTranslation[] | null;
}

/**
 * ContributeTranslationModal component for adding new translations.
 * Features debounced lexeme search, sense selection, and new translation creation.
 */
export default function ContributeTranslationModal({
  open,
  onOpenChange,
  language,
  onSuccess,
  lexemeTranslations,
}: ContributeModalProps) {
  /**
   * Current search query entered by the user
   */
  const [query, setQuery] = useState("");
  /**
   * Array of lexeme search results
   */
  const [lexemes, setLexemes] = useState<LexemeSearchResult[]>([]);
  /**
   * Flag indicating if user has selected an existing lexeme
   */
  const [hasSelectedLexeme, setHasSelectedLexeme] = useState(false);
  /**
   * Currently selected sense ID from lexeme search results
   */
  const [selectedSenseId, setSelectedSenseId] = useState<string | null>(null);
  /**
   * Submission loading state
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /**
   * Debounce timeout reference for search
   */
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const { selectedLexeme, addTranslation } = useApiWithStore();
  /**
   * Input element reference for focus management
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Debounced lexeme search function. Searches for lexemes matching the query in the target language.
   * @param searchQuery - The search term to look for
   */
  const searchLexemes = useCallback(async (searchQuery: string) => {
    if (!language?.lang_code || searchQuery.length < 2) {
      setLexemes([]);
      return;
    }

    try {
      const request: LexemeSearchRequest = {
        ismatch: 1,
        search: searchQuery,
        src_lang: language.lang_code,
        with_sense: true,
      };
      const results = await api.searchLexemes(request);
      setLexemes(results);
    } catch (error) {
      console.error("Error searching lexemes:", error);
      setLexemes([]);
    }
  }, [language]);

  /**
   * Effect for debounced search. Triggers search after 300ms delay when query changes.
   */
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchLexemes(query);
    }, 300);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [query, searchLexemes, searchTimeout]);

  /**
   * Effect to reset state when modal closes and focus input when opens.
   */
  useEffect(() => {
    if (!open) {
      setQuery("");
      setLexemes([]);
      setHasSelectedLexeme(false);
      setSelectedSenseId(null);
    } else {
      inputRef.current?.focus();
    }
  }, [open]);

  /**
   * Memoized base lexeme from existing translations for the current language.
   */
  const baseLexeme = useMemo(() => {
    return lexemeTranslations?.find((t) => t.trans_language === language?.lang_code)?.base_lexeme || "";
  }, [lexemeTranslations, language]);

  /**
   * Handler for selecting a lexeme from search results.
   * @param lexeme - The lexeme to select
   */
  const handleLexemeSelect = useCallback((lexeme: LexemeSearchResult) => {
    setQuery(lexeme.label);
    setHasSelectedLexeme(true);
    setSelectedSenseId(lexeme.sense_id || null);
    setLexemes([]);
  }, []);

  /**
   * Handler for form submission. Validates input and submits translation request.
   */
  const handleSubmit = async () => {
    if (!selectedSenseId || !baseLexeme || !query.trim()) {
      alert("Please select a sense and enter a valid translation");
      return;
    }

    setIsSubmitting(true);
    try {
      const request: AddTranslationRequest[] = [{
        base_lexeme,
        translation_sense_id: selectedSenseId,
        translation_language: language!.lang_code,
        value: query.trim(),
        is_new: !hasSelectedLexeme,
        categoryId: selectedLexeme?.lexeme?.lexicalCategoryId || "",
      }];

      await addTranslation(request);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting translation:", error);
      alert("Failed to save translation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Computed value determining if submit button should be enabled.
   */
  const canSubmit = !isSubmitting && !!query.trim() && !!selectedSenseId && !!baseLexeme;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Translation Contribution
            <Tooltip description="Add a translation to help improve our translations for this language." />
          </DialogTitle>
          <DialogDescription>
            Add a translation to help improve our translations for{" "}
            {language?.lang_label || "the language"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for existing lexemes or enter new translation"
            className="w-full h-12 text-lg"
            disabled={isSubmitting}
          />

          {lexemes.length > 0 && !hasSelectedLexeme && (
            <div className="w-full bg-background border rounded-lg shadow-sm max-h-40 overflow-auto">
              {lexemes.map((lexeme) => (
                <button
                  key={lexeme.id}
                  type="button"
                  onClick={() => handleLexemeSelect(lexeme)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-1 flex items-center space-x-3 transition-colors",
                  )}
                  aria-label={`Select lexeme: ${lexeme.label}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{lexeme.label}</div>
                    {lexeme.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {lexeme.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && lexemes.length === 0 && !hasSelectedLexeme && (
            <div className="text-destructive text-sm text-center py-2">
              No matching lexemes found. You can create a new one.
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Spinner loading size="sm" />
                  Saving...
                </>
              ) : hasSelectedLexeme ? (
                "Save existing translation"
              ) : (
                "Save new translation"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
