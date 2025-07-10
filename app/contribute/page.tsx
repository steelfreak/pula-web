"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { WikimediaCategoryModal, type WikimediaCategoryData } from "@/components/contribution/wikimedia-category-modal"
import { EnhancedWordListManager } from "@/components/contribution/enhanced-word-list-manager"
import { RecordingInterface } from "@/components/contribution/recording-interface"
import { ReviewInterface } from "@/components/contribution/review-interface"
import { LanguageSelection } from "@/components/contribution/language-selection"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"


// Updated steps without Hardware Check
const steps = [
  { id: 1, name: "Language", completed: false },
  { id: 2, name: "Word List", completed: false },
  { id: 3, name: "Record", completed: false },
  { id: 4, name: "Review", completed: false },
]

interface LexemeWord {
  id: string
  word: string
  hasAudio: boolean
  hasLabel: boolean
  audioBlob?: Blob
  label?: string
  language: string
}

interface WordRecording {
  word: string
  audioBlob?: Blob
  isRecorded: boolean
  duration?: number
}

export default function ContributePage() {
  const [currentStep, setCurrentStep] = useState(1) // Starting at Language
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isWikimediaModalOpen, setIsWikimediaModalOpen] = useState(false)
  const [wordList, setWordList] = useState<LexemeWord[]>([])
  const [recordings, setRecordings] = useState<WordRecording[]>([])
  const [primaryLanguage, setPrimaryLanguage] = useState("")
  const [targetLanguages, setTargetLanguages] = useState<string[]>([])

  // Auto-save functionality
  useEffect(() => {
    const saveData = {
      currentStep,
      completedSteps,
      wordList,
      primaryLanguage,
      targetLanguages,
      timestamp: Date.now(),
    }
    localStorage.setItem("contribute-session", JSON.stringify(saveData))
  }, [currentStep, completedSteps, wordList, primaryLanguage, targetLanguages])

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("contribute-session")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Only restore if saved within last 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setCurrentStep(parsed.currentStep || 1)
          setCompletedSteps(parsed.completedSteps || [])
          setWordList(parsed.wordList || [])
          setPrimaryLanguage(parsed.primaryLanguage || "")
          setTargetLanguages(parsed.targetLanguages || [])
        }
      } catch (error) {
        console.error("Error loading saved session:", error)
      }
    }
  }, [])

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId === currentStep || stepId === currentStep + 1) {
      setCurrentStep(stepId)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleLanguageChange = (primary: string, targets: string[]) => {
    setPrimaryLanguage(primary)
    setTargetLanguages(targets)
  }

  const handleWikimediaModalSave = (data: WikimediaCategoryData) => {
    console.log("Wikimedia Category Data:", data)
    // Convert to LexemeWord format with mixed states for demo
    const mockWords: LexemeWord[] = [
      { id: "wiki-1", word: "Educational consultant", hasAudio: false, hasLabel: true, language: data.source },
      { id: "wiki-2", word: "End of studies collage", hasAudio: false, hasLabel: false, language: data.source },
      { id: "wiki-3", word: "Language barrier", hasAudio: true, hasLabel: false, language: data.source },
      { id: "wiki-4", word: "Life Study", hasAudio: false, hasLabel: false, language: data.source },
      { id: "wiki-5", word: "Mississippi Miracle", hasAudio: false, hasLabel: true, language: data.source },
      { id: "wiki-6", word: "Prison education", hasAudio: true, hasLabel: false, language: data.source },
      { id: "wiki-7", word: "Social work management", hasAudio: false, hasLabel: false, language: data.source },
      { id: "wiki-8", word: "Newcomer education", hasAudio: false, hasLabel: true, language: data.source },
    ]

    // Only add words that need work (not complete)
    const incompleteWords = mockWords.filter((word) => !word.hasAudio || !word.hasLabel)
    const newWords = incompleteWords.filter((word) => !wordList.find((w) => w.word === word.word))
    setWordList([...wordList, ...newWords])
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <LanguageSelection onLanguageChange={ handleLanguageChange } />

      case 2:
        return (
          <EnhancedWordListManager
            words={ wordList }
            onWordsChange={ setWordList }
            onOpenWikimediaModal={ () => setIsWikimediaModalOpen(true) }
          />
        )

      case 3:
        return (
          <RecordingInterface
            words={ wordList }
            onComplete={ () => {
              if (!completedSteps.includes(3)) {
                setCompletedSteps([...completedSteps, 3])
              }
              setCurrentStep(4)
            } }
            setRecordings={ setRecordings }
            recordings={ recordings }
          />
        )

      case 4:
        return (
          <ReviewInterface
            recordings={ recordings }
            onSubmit={ () => {
              console.log("Submit recordings")
              // Clear saved session on successful submit
              localStorage.removeItem("contribute-session")
            } }
          />
        )

      default:
        return null
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return primaryLanguage && targetLanguages.length > 0
      case 2:
        return wordList.length > 0
      default:
        return currentStep < steps.length
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */ }
      <Header />
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Contribute to Lexemes</h1>
          <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */ }
        <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6">
          <nav className="space-y-2">
            { steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id
              const isAccessible = isCompleted || isCurrent || step.id === currentStep + 1

              return (
                <button
                  key={ step.id }
                  onClick={ () => handleStepClick(step.id) }
                  disabled={ !isAccessible }
                  className={ cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    isCurrent && "bg-blue-600 text-white",
                    isCompleted && !isCurrent && "bg-gray-100 text-gray-700",
                    !isAccessible && "opacity-50 cursor-not-allowed",
                    isAccessible && !isCurrent && !isCompleted && "hover:bg-gray-100",
                  ) }
                >
                  <div
                    className={ cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      isCurrent && "bg-white text-blue-600",
                      isCompleted && !isCurrent && "bg-blue-600 text-white",
                      !isCurrent && !isCompleted && "bg-gray-300 text-gray-600",
                    ) }
                  >
                    { isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : step.id }
                  </div>
                  <span className="font-medium">{ step.name }</span>
                </button>
              )
            }) }
          </nav>
        </aside>

        {/* Main content */ }
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto">{ renderStepContent() }</div>

          {/* Navigation footer */ }
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={ handlePrevious }
                disabled={ currentStep === 1 }
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button onClick={ handleNext } disabled={ !canProceedToNext() } className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */ }
      <WikimediaCategoryModal
        isOpen={ isWikimediaModalOpen }
        onClose={ () => setIsWikimediaModalOpen(false) }
        onSave={ handleWikimediaModalSave }
      />
      <Footer />
      <Toaster />
    </div>
  )
}
