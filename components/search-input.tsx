"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { LexemeSearchResult } from "@/lib/types/api";
import { Tooltip } from "@/components/ui/tooltip-info";

/**
 * Props for the SearchInput component.
 * @interface SearchInputProps
 * @property {boolean} [disabled] - Whether the search input is disabled. Defaults to false.
 * @property {function} onSearch - Callback function triggered when search is executed. Receives the search query as string parameter.
 * @property {string} value - Current value of the search input.
 * @property {function} onChange - Callback function for input value changes. Receives the new value as string parameter.
 */
interface SearchInputProps {
  /** Whether the search input is disabled. Defaults to false. */
  disabled?: boolean;
  /** Callback function triggered when search is executed. Receives the search query as string parameter. */
  onSearch: (query: string) => void;
  /** Current value of the search input. */
  value: string;
  /** Callback function for input value changes. Receives the new value as string parameter. */
  onChange: (value: string) => void;
}

/**
 * SearchInput is a fully-featured search component with autocomplete suggestions, keyboard navigation,
 * debounced search, and accessibility features. Displays lexeme search results with hover states and
 * keyboard selection support.
 *
 * ## Features:
 * - Debounced search (300ms) to optimize API calls
 * - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - Click outside to close suggestions
 * - Loading states and empty states
 * - Disabled state with toast notification
 * - Clear button functionality
 * - Tooltip with usage instructions
 *
 * @param {SearchInputProps} props - Component props
 * @returns {JSX.Element} Search input with autocomplete dropdown
 * @example
 * ```
 * <SearchInput
 *   value={searchValue}
 *   onChange={setSearchValue}
 *   onSearch={handleSearch}
 *   disabled={!languagesSelected}
 * />
 * ```
 */
export default function SearchInput({
  disabled = false,
  onSearch,
  value,
  onChange,
}: SearchInputProps) {
  /** Show/hide autocomplete suggestions dropdown */
  const [showSuggestions, setShowSuggestions] = useState(false);
  /** Track if user is actively typing */
  const [isTyping, setIsTyping] = useState(false);
  /** Currently selected suggestion index for keyboard navigation */
  const [selectedIndex, setSelectedIndex] = useState(-1);
  /** Local search query state for controlled input */
  const [searchQuery, setSearchQuery] = useState(value);
  /** Reference to the input element */
  const inputRef = useRef<HTMLInputElement>(null);
  /** Reference to the suggestions dropdown container */
  const suggestionsRef = useRef<HTMLDivElement>(null);
  /** Toast notification hook */
  const { toast } = useToast();

  /** API and store hooks for lexeme search functionality */
  const {
    searchLexemes,
    selectedSourceLanguage,
    lexemes,
    lexemeLoading,
    setClickedLexeme,
    setLexemes,
  } = useApiWithStore();

  /**
   * Sync local search query with external value prop
   */
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  /**
   * Debounced search effect - triggers API search after 300ms of typing
   * Only runs if source language is selected and query is not empty
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      if (selectedSourceLanguage) {
        searchLexemes({
          ismatch: 0,
          search: searchQuery,
          src_lang: selectedSourceLanguage.lang_code,
          with_sense: false,
        }).catch((err) => console.error("Search failed:", err));
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSourceLanguage, searchLexemes]);

  /**
   * Handle input value changes - updates local state and triggers debounced search
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setIsTyping(true);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  /**
   * Handle input focus - shows toast if disabled, otherwise shows suggestions
   */
  const handleInputFocus = () => {
    if (disabled) {
      toast({
        title: "Languages required",
        description: "You must select source and target language first.",
        variant: "destructive",
      });
      inputRef.current?.blur();
      return;
    }
    if (searchQuery.length > 0) setShowSuggestions(true);
  };

  /**
   * Close suggestions when clicking outside the input or dropdown
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Handle keyboard navigation and search actions
   * @param e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !showSuggestions || lexemes.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < lexemes.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(lexemes[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  /**
   * Select a suggestion from dropdown - updates input and triggers search
   * @param suggestion - Selected lexeme search result
   */
  const handleSuggestionSelect = (suggestion: LexemeSearchResult) => {
    setIsTyping(false);
    setSearchQuery(suggestion.label);
    onChange(suggestion.label);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setClickedLexeme(suggestion);
    onSearch(suggestion.label);
    inputRef.current?.blur();
  };

  /**
   * Execute search with current query value
   */
  const handleSearch = () => {
    setShowSuggestions(false);
    onSearch(searchQuery);
  };

  /**
   * Clear input field and reset search state
   */
  const clearInput = () => {
    setSearchQuery('');  // Resets the input value
    onChange("");
    setLexemes([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5" style={{ color: disabled ? "#a2a9b1" : "#72777d" }} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Type your word here"
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 rounded-lg text-lg focus:outline-none transition-colors border"
          style={{
            borderColor: "#a2a9b1",
            backgroundColor: disabled ? "#f8f9fa" : "#ffffff",
            color: disabled ? "#a2a9b1" : "#222222",
          }}
        />
        {searchQuery && !disabled && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            style={{ color: "#72777d" }}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {/* Add tooltip for search functionality */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 px-2.5">
          <Tooltip description="Search for words or terms. Select source and target languages first. Use arrow keys to navigate suggestions, Enter to select." />
        </div>

      </div>

      {isTyping && !disabled && showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto border"
          style={{ borderColor: "#a2a9b1" }}
        >
          {lexemeLoading && (
            <div className="px-4 py-3 text-sm" style={{ color: "#72777d" }}>
              Searching...
            </div>
          )}
          {!lexemeLoading && lexemes.length > 0 && (
            <>
              {lexemes.map((lexeme, index) => (
                <button
                  key={lexeme.id}
                  type="button"
                  onClick={() => handleSuggestionSelect(lexeme)}
                  className="w-full text-left px-4 py-3 text-sm focus:outline-none flex items-center space-x-3 transition-colors"
                  style={{
                    backgroundColor:
                      index === selectedIndex ? "#f8f9fa" : "transparent",
                    color: "#222222",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index === selectedIndex ? "#f8f9fa" : "transparent")
                  }
                >
                  <Search className="h-4 w-4" style={{ color: "#72777d" }} />
                  <div className="flex-1">
                    <div className="font-medium">{lexeme.label}</div>
                    <div className="text-xs" style={{ color: "#72777d" }}>
                      {lexeme.description}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
          {!lexemeLoading && lexemes.length === 0 && (
            <div className="px-4 py-3 text-sm font-semibold" style={{ color: "#000000" }}>
              No data found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
