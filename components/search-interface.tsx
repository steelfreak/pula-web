"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSelect from "@/components/language-select";
import SearchInput from "@/components/search-input";
import { useToast } from "@/components/ui/use-toast";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { Tooltip } from "@/components/ui/tooltip-info";

/**
 * SearchInterface component - Main search page for language translation exploration.
 * Allows users to select source and target languages, then search for words/phrases.
 * 
 * @component
 * @returns {JSX.Element} The search interface UI with language selectors and search input.
 */
export default function SearchInterface() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    getLanguages,
    languageLoading,
    languageError,
    languages,
    selectedSourceLanguage,
    selectedTargetLanguage1,
    selectedTargetLanguage2,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    clickedLexeme,
    isSearchReady,
  } = useApiWithStore();

  /**
   * Loads available languages when component mounts.
   * 
   * @effect
   * @see useApiWithStore#getLanguages
   */
  useEffect(() => {
    getLanguages();
  }, []);

  /**
   * Redirects to results page when a lexeme is clicked from search results.
   * 
   * @effect
   * @param {Object|null} clickedLexeme - The clicked lexeme object from store.
   * @see useRouter#push
   */
  useEffect(() => {
    if (clickedLexeme) {
      router.push(`/results/${encodeURIComponent(clickedLexeme.id)}`);
    }
  }, [clickedLexeme]);

  /**
   * Handles search query submission.
   * Shows toast error if required languages aren't selected.
   * 
   * @param {string} query - The search term entered by the user.
   * @returns {void}
   */
  const handleSearch = (query: string) => {
    if (!isSearchReady) {
      toast({
        title: "Languages required",
        description:
          "You must select a source language and at least one target language first.",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <div className="text-center mb-12" data-tour="page-title">
        <h1 className="text-3xl font-normal mb-4" style={{ color: "#222222" }}>
          Explore words and phrases in other languages
        </h1>
        <p className="max-w-2xl mx-auto" style={{ color: "#72777d" }}>
          Select languages to proceed.
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LanguageSelect
            value={selectedSourceLanguage?.lang_code || ""}
            onChange={(langCode) => {
              const language = languages.find(
                (lang) => lang.lang_code === langCode
              );
              setSelectedSourceLanguage(language || null);

              // Clear targets if they match the new source
              if (selectedTargetLanguage1?.lang_code === langCode) {
                setSelectedTargetLanguage1(null);
              }
              if (selectedTargetLanguage2?.lang_code === langCode) {
                setSelectedTargetLanguage2(null);
              }
            }}
            placeholder="Select source language"
            label="Source Language"
          />
          <LanguageSelect
            value={selectedTargetLanguage1?.lang_code || ""}
            onChange={(langCode) => {
              const language = languages.find(
                (lang) => lang.lang_code === langCode
              );
              setSelectedTargetLanguage1(language || null);

              // Clear target 2 if it matches the new target 1
              if (selectedTargetLanguage2?.lang_code === langCode) {
                setSelectedTargetLanguage2(null);
              }
            }}
            placeholder="Select target language 1"
            label="Target Language 1"
            span="*"
            excludedLanguages={[
              ...(selectedSourceLanguage ? [selectedSourceLanguage.lang_code] : []),
              ...(selectedTargetLanguage2 ? [selectedTargetLanguage2.lang_code] : []),
            ]}
          />
          <LanguageSelect
            value={selectedTargetLanguage2?.lang_code || ""}
            onChange={(langCode) => {
              const language = languages.find(
                (lang) => lang.lang_code === langCode
              );
              setSelectedTargetLanguage2(language || null);
            }}
            placeholder="Select target language 2"
            label="Target Language 2 (optional)"
            excludedLanguages={[
              ...(selectedSourceLanguage ? [selectedSourceLanguage.lang_code] : []),
              ...(selectedTargetLanguage1 ? [selectedTargetLanguage1.lang_code] : []),
            ]}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8" data-tour="search-input">
        <SearchInput
          disabled={!isSearchReady}
          onSearch={handleSearch}
          value={""}
          onChange={(v) => null}
        />
      </div>

      {/* Instructions */}
      {!isSearchReady && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#f8f9fa",
            borderColor: "#a2a9b1",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <p style={{ color: "#72777d" }}>
              Please select a source language and at least one target language to
              enable search
            </p>
            <Tooltip description="Select your source language (what you're translating from) and one or more target languages (what you're translating to) to search for words and contribute translations." />
          </div>
        </div>
      )}

      {/* Language Loading Error */}
      {languageError && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#fecaca",
          }}
        >
          <p style={{ color: "#dc2626" }}>
            Error loading languages: {languageError}
          </p>
        </div>
      )}
    </div>
  );
}
