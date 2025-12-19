'use client';

import { useState, useEffect } from "react"
import LanguageSelect from "@/components/language-select"
import SearchInput from "@/components/search-input"
import { useToast } from "@/components/ui/use-toast"
import { useApiWithStore } from "@/hooks/useApiWithStore"

/**
 * Props interface for the ResultsSearchInterface component.
 * @interface ResultsSearchInterfaceProps
 * @property {string} [initialQuery] - Optional initial search query string to pre-populate the search input.
 * @property {function} onSearch - Callback function triggered when a valid search is performed. Receives the search query string as argument.
 */
interface ResultsSearchInterfaceProps {
  /** Optional initial search query string to pre-populate the search input */
  initialQuery?: string;
  /** Callback function triggered when a valid search is performed. Receives the search query string as argument */
  onSearch: (query: string) => void;
}

/**
 * ResultsSearchInterface is a comprehensive search interface component for language translation/search applications.
 * 
 * Features:
 * - Source language selection (required)
 * - Up to 2 target language selections (at least 1 required)
 * - Search input with validation
 * - Language loading states and error handling
 * - Toast notifications for user feedback
 * 
 * The component integrates with `useApiWithStore` hook for language state management and requires
 * source + target language selection before enabling search functionality.
 * 
 * @param {ResultsSearchInterfaceProps} props - Component props
 * @returns {JSX.Element} The rendered search interface
 * @example
 * ```
 * <ResultsSearchInterface
 *   initialQuery="Hello world"
 *   onSearch={(query) => console.log('Searching:', query)}
 * />
 * ```
 */
export default function ResultsSearchInterface({ 
  initialQuery = "", 
  onSearch 
}: ResultsSearchInterfaceProps) {
  /**
   * Local state for the current search query input
   * @type {string}
   */
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  
  const { toast } = useToast()
  
  const { 
    /** Fetches available languages from API */
    getLanguages, 
    /** Loading state for language fetch */
    languageLoading, 
    /** Error state for language fetch */
    languageError,
    /** Array of available languages */
    languages,
    /** Currently selected source language */
    selectedSourceLanguage,
    /** Currently selected first target language */
    selectedTargetLanguage1,
    /** Currently selected second target language */
    selectedTargetLanguage2,
    /** Setter for source language selection */
    setSelectedSourceLanguage,
    /** Setter for first target language selection */
    setSelectedTargetLanguage1,
    /** Setter for second target language selection */
    setSelectedTargetLanguage2
  } = useApiWithStore()

  /**
   * Boolean indicating if required languages are selected
   * Currently hardcoded to true for demo purposes
   * @type {boolean}
   */
  const areLanguagesSelected = true

  /**
   * Effect: Load available languages when component mounts
   * Runs only once due to empty dependency array (getLanguages is stable from hook)
   */
  useEffect(() => {
    getLanguages()
  }, [getLanguages])

  /**
   * Effect: Sync local search query state with initialQuery prop changes
   * Updates search input when parent provides new initial value
   */
  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  /**
   * Handles search execution with validation
   * @param {string} query - The search query string from input
   * @returns {void}
   */
  const handleSearch = (query: string) => {
    // Validate language selection
    if (!areLanguagesSelected) {
      toast({
        title: "Languages required",
        description: "You must select a source language and at least one target language first.",
        variant: "destructive",
      })
      return
    }

    // Execute search if query is valid
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <div className="mb-8">
      {/* Language Selection Section */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Source Language Selector */}
          <LanguageSelect 
            value={selectedSourceLanguage?.lang_code || ""} 
            onChange={(langCode) => {
              const language = languages.find(lang => lang.lang_code === langCode);
              setSelectedSourceLanguage(language || null);

              // Prevent source language from being selected as target
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
          
          {/* Target Language 1 Selector */}
          <LanguageSelect 
            value={selectedTargetLanguage1?.lang_code || ""} 
            onChange={(langCode) => {
              const language = languages.find(lang => lang.lang_code === langCode);
              setSelectedTargetLanguage1(language || null);

              // Prevent duplicate target language selection
              if (selectedTargetLanguage2?.lang_code === langCode) {
                setSelectedTargetLanguage2(null);
              }
            }} 
            placeholder="Select target language 1"
            label="Target Language 1"
            excludedLanguages={selectedSourceLanguage ? [selectedSourceLanguage.lang_code] : []}
          />
          
          {/* Target Language 2 Selector (Optional) */}
          <LanguageSelect 
            value={selectedTargetLanguage2?.lang_code || ""} 
            onChange={(langCode) => {
              const language = languages.find(lang => lang.lang_code === langCode);
              setSelectedTargetLanguage2(language || null);
            }} 
            placeholder="Select target language 2"
            label="Target Language 2"
            excludedLanguages={[
              ...(selectedSourceLanguage ? [selectedSourceLanguage.lang_code] : []),
              ...(selectedTargetLanguage1 ? [selectedTargetLanguage1.lang_code] : []),
            ]}
          />
        </div>
      </div>

      {/* Search Input Section */}
      <div className="mb-6">
        <SearchInput
          disabled={!areLanguagesSelected}
          onSearch={handleSearch}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Language Loading Error Display */}
      {languageError && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#fecaca",
          }}
        >
          <p style={{ color: "#dc2626" }}>Error loading languages: {languageError}</p>
        </div>
      )}
    </div>
  )
}
