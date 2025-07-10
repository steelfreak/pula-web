"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LanguageSelect from "@/components/language-select"
import SearchInput from "@/components/search-input"
import { useToast } from "@/components/ui/use-toast"
import { useApiWithStore } from "@/hooks/useApiWithStore"

export default function SearchInterface() {
  const [sourceLanguage, setSourceLanguage] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { getLanguages, languageLoading, languageError } = useApiWithStore()

  const areLanguagesSelected = sourceLanguage !== "" && targetLanguage !== ""

  // Load languages when component mounts
  useEffect(() => {
    getLanguages()
  }, [])

  const handleSearch = (query: string) => {
    if (!areLanguagesSelected) {
      toast({
        title: "Languages required",
        description: "You must select source and destination language first.",
        variant: "destructive",
      })
      return
    }

    if (query) {
      router.push(`/results/${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-normal mb-4" style={{ color: "#222222" }}>
          Easiest way to translate from one language to another
        </h1>
        <p className="max-w-2xl mx-auto" style={{ color: "#72777d" }}>
          Enter a word or phrase to get translations instantly.
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#222222" }}>
              Source Language
            </label>
            <LanguageSelect value={sourceLanguage} onChange={setSourceLanguage} placeholder="Select source language" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#222222" }}>
              Target Language
            </label>
            <LanguageSelect value={targetLanguage} onChange={setTargetLanguage} placeholder="Select target language" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          disabled={!areLanguagesSelected}
          onSearch={handleSearch}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Instructions */}
      {!areLanguagesSelected && (
        <div
          className="border rounded p-4 text-center"
          style={{
            backgroundColor: "#f8f9fa",
            borderColor: "#a2a9b1",
          }}
        >
          <p style={{ color: "#72777d" }}>Please select source and target languages to enable search</p>
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
          <p style={{ color: "#dc2626" }}>Error loading languages: {languageError}</p>
        </div>
      )}
    </div>
  )
}
