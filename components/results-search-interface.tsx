'use client';

import { useState, useEffect } from "react"
import LanguageSelect from "@/components/language-select"
import SearchInput from "@/components/search-input"
import { useToast } from "@/components/ui/use-toast"
import { useApiWithStore } from "@/hooks/useApiWithStore"

interface ResultsSearchInterfaceProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export default function ResultsSearchInterface({ initialQuery = "", onSearch }: ResultsSearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const { toast } = useToast()
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
    setSelectedTargetLanguage2
  } = useApiWithStore()

  // const areLanguagesSelected = selectedSourceLanguage && (selectedTargetLanguage1 || selectedTargetLanguage2)
  const areLanguagesSelected = true

  // Load languages when component mounts
  useEffect(() => {
    getLanguages()
  }, [getLanguages])

  // Set initial query when prop changes
  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  const handleSearch = (query: string) => {
    if (!areLanguagesSelected) {
      toast({
        title: "Languages required",
        description: "You must select a source language and at least one target language first.",
        variant: "destructive",
      })
      return
    }

    if (query) {
      onSearch(query)
    }
  }

  return (
    <div className="mb-8">
      {/* Language Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LanguageSelect 
            value={selectedSourceLanguage?.lang_code || ""} 
            onChange={(langCode) => {
              const language = languages.find(lang => lang.lang_code === langCode);
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
              const language = languages.find(lang => lang.lang_code === langCode);
              setSelectedTargetLanguage1(language || null);

              // Clear target 2 if it matches the new target 1
              if (selectedTargetLanguage2?.lang_code === langCode) {
                setSelectedTargetLanguage2(null);
              }
            }} 
            placeholder="Select target language 1"
            label="Target Language 1"
            excludedLanguages={selectedSourceLanguage ? [selectedSourceLanguage.lang_code] : []}
          />
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

      {/* Search Input */}
      <div className="mb-6">
        <SearchInput
          disabled={!areLanguagesSelected}
          onSearch={handleSearch}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Instructions */}
      {/* {!areLanguagesSelected && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#f8f9fa",
            borderColor: "#a2a9b1",
          }}
        >
          <p style={{ color: "#72777d" }}>
            Please select a source language and at least one target  
          </p>
        </div>
      )} */}

      {/* Language Loading Error */}
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