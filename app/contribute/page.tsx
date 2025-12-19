"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { EnhancedWordListManager } from "@/components/contribution/enhanced-word-list-manager"
import { RecordingInterface } from "@/components/contribution/recording-interface"
import { ReviewInterface } from "@/components/contribution/review-interface"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { useApiWithStore } from "@/hooks/useApiWithStore"
import type { Language, LexemeMissingAudioResponse, LexemeSearchResult } from "@/lib/types/api"
import { LanguageSelection } from "@/components/contribution/language-selection"
import type { RecordingData, WordListItem, LanguageData } from '@/types/recording'

export default function ContributePage() {
  // API hooks
  const { getLexemeMissingAudio, searchLexemes, languages } = useApiWithStore()

  // State
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isWikimediaModalOpen, setIsWikimediaModalOpen] = useState(false)
  const [wordList, setWordList] = useState<WordListItem[]>([])
  const [recordings, setRecordings] = useState<RecordingData[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageData | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [loadingWords, setLoadingWords] = useState(false)
  const [lexemeApiError, setLexemeApiError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load missing audio lexemes when language/page/pageSize changes (after step 1)
  useEffect(() => {
    if (currentStep === 2 && selectedLanguage) {
      fetchMissingAudioWords(selectedLanguage, page, pageSize)
    }
  }, [currentStep, selectedLanguage, page, pageSize])

  // Fetch missing audio lexemes from API and map to LexemeWord[]
  const fetchMissingAudioWords = async (language: Language, page: number, pageSize: number) => {
    setLoadingWords(true)
    setLexemeApiError(null)
    try {
      const result = await getLexemeMissingAudio({
        lang_code: language.lang_code,
        lang_wdqid: language.lang_wd_id || "",
        page,
        page_size: pageSize,
      })
      // Map API result to LexemeWord[]
      const mapped: WordListItem[] = Array.isArray(result)
        ? result.map((item: LexemeMissingAudioResponse) => ({
            lexeme_id: item.lexeme_id,
            formId: item.formId,
            lemma: item.lemma,
            categoryId: item.categoryId,
            categoryLabel: item.categoryLabel,
            sense_id: item.sense_id,
            lang_code: language.lang_code,
            hasAudio: false,
            lang_label: language.lang_label,
            lang_wdqid: language.lang_wd_id || ""
          }))
        : []
      setWordList(mapped)
    } catch (err: any) {
      setLexemeApiError(err.message || "Failed to load words")
      setWordList([])
    } finally {
      setLoadingWords(false)
    }
  }

  // Handle language selection (step 1)
  const handleLanguageSelect = (langCode: string) => {
    const lang = languages.find((l: Language) => l.lang_code === langCode) || null
    setSelectedLanguage(lang)
  }

  // Handle Wikimedia modal save (add new words)
  const handleWikimediaModalSave = (data: any) => {
    // Wikimedia data should be fetched from API instead of creating mock data
    console.warn("Wikimedia category handling should be implemented with proper API integration")
  }

  // Search handler for SearchInput in EnhancedWordListManager
  const handleWordSearch = async (query: string) => {
    if (!selectedLanguage || !query.trim()) return
    setLoadingWords(true)
    try {
      const results: LexemeSearchResult[] = await searchLexemes({
        ismatch: 0,
        search: query,
        src_lang: selectedLanguage.lang_code,
      })
      
      // Add new results to wordList if not already present
      const newWords: WordListItem[] = results
        .filter((item: LexemeSearchResult) => !wordList.some((w) => w.lexeme_id === item.id))
        .map((item: LexemeSearchResult) => ({
          lexeme_id: item.id,
          formId: `${item.id}-F1`, // You might need to fetch the actual form ID
          lemma: item.label,
          categoryId: "",
          categoryLabel: item.description || "",
          sense_id: `${item.id}-S1`, // You might need to fetch the actual sense ID
          hasAudio: false,
          lang_code: selectedLanguage.lang_code,
          lang_label: selectedLanguage.lang_label,
          lang_wdqid: selectedLanguage.lang_wd_id || ""
        }))
      if (newWords.length > 0) setWordList((prev) => [...prev, ...newWords])
    } catch (err) {
      // Optionally handle error
      console.error("Error searching words:", err)
    } finally {
      setLoadingWords(false)
    }
  }

  // Navigation
  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId === currentStep || stepId === currentStep + 1) {
      setCurrentStep(stepId)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1 && selectedLanguage) {
      setCurrentStep(2)
      setCompletedSteps((prev) => [...prev, 1])
      setPage(1) // Reset pagination
    } else if (currentStep === 2) {
      setCurrentStep(3)
      setCompletedSteps((prev) => [...prev, 2])
    } else if (currentStep === 3) {
      setCurrentStep(4)
      setCompletedSteps((prev) => [...prev, 3])
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <LanguageSelection
            value={selectedLanguage?.lang_code || ""}
            onChange={handleLanguageSelect}
            placeholder="Select source language"
            label="Source Language"
          />
        )
      case 2:
        return (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <label>
                Page Size:
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="ml-2 border rounded px-2 py-1 w-20"
                />
              </label>
              <label>
                Page:
                <input
                  type="number"
                  min={1}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="ml-2 border rounded px-2 py-1 w-20"
                />
              </label>
              <Button onClick={() => fetchMissingAudioWords(selectedLanguage!, page, pageSize)} disabled={loadingWords}>
                Refresh
              </Button>
            </div>
            {lexemeApiError && <div className="text-red-600 mb-2">{lexemeApiError}</div>}
            <EnhancedWordListManager
              words={wordList}
              loadingWords={loadingWords}
              onWordsChange={(lexemeWords) => {
                // Map LexemeWord[] to WordListItem[]
                const mapped = lexemeWords.map((item: any) => ({
                  lexeme_id: item.lexeme_id,
                  formId: item.formId,
                  lemma: item.lemma,
                  audioBlob: item.audioBlob,
                  hasAudio: item.hasAudio,
                  categoryId: item.categoryId,
                  categoryLabel: item.categoryLabel,
                  sense_id: item.sense_id,
                  lang_code: item.lang_code ?? selectedLanguage?.lang_code ?? "",
                  lang_label: item.lang_label ?? selectedLanguage?.lang_label ?? "",
                  lang_wdqid: item.lang_wdqid ?? selectedLanguage?.lang_wd_id ?? ""
                }))
                setWordList(mapped)
              }}
              onOpenWikimediaModal={() => setIsWikimediaModalOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleWordSearch}
            />
          </div>
        )
      case 3:
        return (
          <RecordingInterface
            words={wordList}
            onComplete={() => {
              if (!completedSteps.includes(3)) {
                setCompletedSteps([...completedSteps, 3])
              }
              setCurrentStep(4)
            }}
            setRecordings={setRecordings}
            recordings={recordings}
          />
        )
      case 4:
        return (
          <ReviewInterface
            recordings={recordings}
            onSubmit={() => {
              localStorage.removeItem("contribute-session")
            }}
          />
        )
      default:
        return null
    }
  }

  // Step navigation logic
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!selectedLanguage
      case 2:
        return wordList.length > 0
      default:
        return currentStep < 4
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6 pt-12">
          <nav className="space-y-2">
            {[1,2,3,4].map((stepId) => {
              const isCompleted = completedSteps.includes(stepId)
              const isCurrent = currentStep === stepId
              const isAccessible = isCompleted || isCurrent || stepId === currentStep + 1

              return (
                <button
                  key={stepId}
                  onClick={() => handleStepClick(stepId)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    isCurrent && "bg-blue-600 text-white",
                    isCompleted && !isCurrent && "bg-gray-100 text-gray-700",
                    !isAccessible && "opacity-50 cursor-not-allowed",
                    isAccessible && !isCurrent && !isCompleted && "hover:bg-gray-100",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      isCurrent && "bg-white text-blue-600",
                      isCompleted && !isCurrent && "bg-blue-600 text-white",
                      !isCurrent && !isCompleted && "bg-gray-300 text-gray-600",
                    )}
                  >
                    {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : stepId}
                  </div>
                  <span className="font-medium">
                    {['Language', 'Word List', 'Record', 'Review'][stepId - 1]}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col pt-12">
          <div className="flex-1 p-6 overflow-auto">{renderStepContent()}</div>
          {/* Navigation footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button onClick={handleNext} disabled={!canProceedToNext()} className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <div>
        {/* WikimediaCategoryModal was unused - removed */}
      </div>
      <Footer />
      <Toaster />
    </div>
  )
}
