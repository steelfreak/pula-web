"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { LexemeSearchResult } from "@/lib/types/api";

interface SearchInputProps {
  disabled?: boolean;
  onSearch: (query: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({
  disabled = false,
  onSearch,
  value,
  onChange,
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setShowSuggestions(false);
  }, []);

  // Get data from stores
  const {
    searchLexemes,
    selectedSourceLanguage,
    lexemes,
    lexemeLoading,
    setClickedLexeme,
  } = useApiWithStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (query.trim() && selectedSourceLanguage) {
            searchLexemes({
              ismatch: 0,
              search: query,
              src_lang: selectedSourceLanguage.lang_code,
              with_sense: false,
            }).catch(() => {
              // Error handling is done in the hook
            });
          }
        }, 300); // 300ms delay
      };
    })(),
    [searchLexemes, selectedSourceLanguage]
  );

  // Trigger search when value changes
  useEffect(() => {
    if (value.trim() === "") {
      setShowSuggestions(false);
      return;
    }

    debouncedSearch(value);
    setShowSuggestions(true);
  }, [value, debouncedSearch]);

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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTyping) {
      setIsTyping(true);
    }
    // onChange(e.target.value)
    setSearchQuery(e.target.value);
    try {
      await searchLexemes({
        ismatch: 0,
        search: e.target.value,
        src_lang: selectedSourceLanguage?.lang_code || "",
        with_sense: false,
      });
    } catch (error) {
      console.error("Search failed:", error);
    }

    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (disabled) {
      toast({
        title: "Languages required",
        description: "You must select source and target language first.",
        variant: "destructive",
      });
      inputRef.current?.blur();
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!showSuggestions || lexemes.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < lexemes.length - 1 ? prev + 1 : prev
        );
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
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: LexemeSearchResult) => {
    setIsTyping(false);
    onChange(suggestion.label);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setClickedLexeme(suggestion); // Save the clicked lexeme to the store
    onSearch(suggestion.label);
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    onSearch(value);
  };

  const clearInput = () => {
    onChange("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className="h-5 w-5"
            style={{ color: disabled ? "#a2a9b1" : "#72777d" }}
          />
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
          className="w-full pl-10 pr-10 py-3 rounded-lg text-lg focus:outline-none transition-colors"
          style={{
            border: `1px solid #a2a9b1`,
            backgroundColor: disabled ? "#f8f9fa" : "#ffffff",
            color: disabled ? "#a2a9b1" : "#222222",
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocusCapture={(e) =>
            !disabled && (e.currentTarget.style.borderColor = "#0645ad")
          }
          onBlur={(e) => (e.currentTarget.style.borderColor = "#a2a9b1")}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
            style={{ color: "#72777d" }}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isTyping && !disabled && showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{ border: `1px solid #a2a9b1` }}
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
