"use client"

import { useState, useRef, useEffect } from "react"
import { api } from "@/lib/api"
import type { AddAudioTranslationRequest } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Grid3X3,
  Mic,
  Square,
  SkipForward,
  SkipBack,
  Keyboard,
  X,
  Tag,
  CheckCircle,
  Edit,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { HardwareCheckModal } from "./hardware-check-modal"

interface LexemeWord {
  lexeme_id: string
  formId: string
  lemma: string
  categoryId: string
  categoryLabel: string
  sense_id: string
  hasAudio: boolean
  audioBlob?: Blob
  lang_label: string
  lang_code: string
  lang_wdqid: string
}

interface RecordingInterfaceProps {
  words: LexemeWord[]
  onComplete: () => void
  setRecordings?: (recordings: WordRecording[]) => void
  recordings?: WordRecording[]
}

interface WordRecording {
  word: string
  audioBlob?: Blob
  isRecorded: boolean
  duration?: number
}


export function RecordingInterface({
  words: propWords,
  onComplete,
  setRecordings,
  recordings: externalRecordings,
}: RecordingInterfaceProps) {
  const [words, setWords] = useState<LexemeWord[]>(propWords.length > 0 ? propWords : [])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [isHardwareCheckOpen, setIsHardwareCheckOpen] = useState(false)
  const [hardwareCheckCompleted, setHardwareCheckCompleted] = useState(false)
  const [currentLabel, setCurrentLabel] = useState("")
  const [showLabelInput, setShowLabelInput] = useState(false)
  const [editingLabel, setEditingLabel] = useState(false)
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const incompleteWords = words.filter((word) => !word.hasAudio)
  const currentWord = incompleteWords[currentWordIndex]
  const completedCount = words.filter((w) => w.hasAudio).length
  const progressPercentage = (completedCount / words.length) * 100

  // Initialize current label when word changes
  useEffect(() => {
    if (currentWord) {
      setCurrentLabel(currentWord.categoryLabel || "")
    }
  }, [currentWord])

  const handleHardwareCheckComplete = (success: boolean) => {
    setIsHardwareCheckOpen(false)
    if (success) {
      setHardwareCheckCompleted(true)
    }
  }

  const prepareAudioSubmission = (word: LexemeWord): Promise<AddAudioTranslationRequest | null> => {
    if (!word.audioBlob) return Promise.resolve(null);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data:audio/wav;base64, prefix from base64 string
        const base64Data = (reader.result as string).split(',')[1];
        
        const submission: AddAudioTranslationRequest = {
          file_content: base64Data,
          filename: `${word.lexeme_id}-${word.lang_code.toLowerCase()}-${word.sense_id}.ogg`,
          formid: `${word.formId}`,
          lang_label: word.lang_label,
          lang_wdqid: word.lang_wdqid
        };
        resolve(submission);
      };
      reader.readAsDataURL(word.audioBlob as Blob);
    });
  }

  const handleSubmitAudio = async () => {
    const submissions = await Promise.all(
      words
        .filter(word => word.hasAudio && word.audioBlob)
        .map(prepareAudioSubmission)
    );

    const validSubmissions = submissions.filter((s): s is AddAudioTranslationRequest => s !== null);
    
    try {
      for (const submission of validSubmissions) {
        await api.addAudioTranslation(submission);
      }
      // Handle successful submission
      onComplete();
    } catch (error) {
      console.error('Error submitting audio:', error);
      // Handle error - you may want to show an error message to the user
    }
  }

  const updateWordData = (wordId: string, updates: Partial<LexemeWord>) => {
    setWords((prev) => prev.map((word) => (word.lexeme_id === wordId ? { ...word, ...updates } : word)))
  }

  // const saveLabel = () => {
  //   if (currentWord && currentLabel.trim()) {
  //     updateWordData(currentWord.lexeme_id, {
  //       hasLabel: true,
  //       label: currentLabel.trim(),
  //     })
  //     setShowLabelInput(false)
  //   }
  // }

  // const startEditingLabel = () => {
  //   setEditingLabel(true)
  //   setCurrentLabel(currentWord?.label || "")
  // }

  // const cancelEditingLabel = () => {
  //   setEditingLabel(false)
  //   setCurrentLabel(currentWord?.label || "")
  // }

  // const saveLabelEdit = () => {
  //   if (currentWord && currentLabel.trim()) {
  //     updateWordData(currentWord.lexeme_id, {
  //       hasLabel: true,
  //       label: currentLabel.trim(),
  //     })
  //     setEditingLabel(false)
  //   }
  // }

  // const openLabelModal = () => {
  //   setCurrentLabel(currentWord?.label || "")
  //   setIsLabelModalOpen(true)
  // }

  // const saveLabelModal = () => {
  //   if (currentWord && currentLabel.trim()) {
  //     updateWordData(currentWord.lexeme_id, {
  //       hasLabel: true,
  //       label: currentLabel.trim(),
  //     })
  //     setIsLabelModalOpen(false)
  //   }
  // }

  const startRecording = async () => {
    if (!hardwareCheckCompleted) {
      setIsHardwareCheckOpen(true)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      audioChunksRef.current = []
      setRecordingTime(0)
      setIsRecording(true)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        if (currentWord) {
          updateWordData(currentWord.lexeme_id, {
            hasAudio: true,
            audioBlob,
          })
        }
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1)
      }, 100)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      setIsRecording(false)
      mediaRecorderRef.current.stop()
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const skipToNext = () => {
    if (currentWordIndex < incompleteWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      onComplete()
    }
  }

  const skipToPrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
    }
  }

  if (!hardwareCheckCompleted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <Mic className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-semibold mb-4">Hardware Check Required</h2>
          <p className="text-gray-600 mb-6">
            Before you can start recording, we need to test your microphone and audio settings.
          </p>
          <Button onClick={ () => setIsHardwareCheckOpen(true) } size="lg">
            Start Hardware Check
          </Button>
        </div>
        <HardwareCheckModal isOpen={ isHardwareCheckOpen } onComplete={ handleHardwareCheckComplete } />
      </div>
    )
  }

  if (!currentWord) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-semibold mb-4">All Done!</h2>
          <p className="text-gray-600 mb-6">All lexemes have been recorded.</p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleSubmitAudio} variant="default">Submit Recordings</Button>
            <Button onClick={onComplete} variant="outline">Review First</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ containerRef }
      className="h-full flex focus:outline-none"
      tabIndex={ 0 }
      role="application"
      aria-label="Recording interface with keyboard shortcuts"
    >
      {/* Word List Sidebar */ }
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Lexeme List</h3>
              <p className="text-sm text-gray-500 mt-1">
                { completedCount } of { words.length } completed
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={ () => setShowKeyboardHelp(!showKeyboardHelp) }
              className="text-gray-500 hover:text-gray-700"
              title="Show keyboard shortcuts (Ctrl+H)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            { incompleteWords.map((word, index) => (
              <button
                key={ word.lexeme_id }
                onClick={ () => setCurrentWordIndex(index) }
                className={ cn(
                  "w-full text-left p-3 rounded-lg mb-1 transition-colors",
                  index === currentWordIndex && "bg-blue-100 border border-blue-200",
                  index !== currentWordIndex && "hover:bg-gray-100",
                ) }
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ word.lemma }</span>
                  <div className="flex items-center gap-1">
                    { !word.hasAudio && (
                      <span title="Needs audio">
                        <Mic className="w-3 h-3 text-orange-500" />
                      </span>
                    ) }
                    { index === currentWordIndex && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Current" />
                    ) }
                  </div>
                </div>
              </button>
            )) }
          </div>
        </div>
      </div>

      {/* Recording Interface */ }
      <div className="flex-1 flex flex-col">
        {/* Header with controls */ }
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Record</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Grid3X3 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Recording Area */ }
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md w-full space-y-8">
            {/* Current Word Display */ }
            <div>
              <h1 className="text-6xl font-bold text-gray-900 mb-4">{ currentWord.lemma }</h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                { !currentWord.hasAudio && (
                  <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    <Mic className="w-4 h-4" />
                    <span>Audio needed</span>
                  </div>
                ) }
              </div>
            </div>

            {/* Audio Recording Section */ }
            { !currentWord.hasAudio && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Record Audio</h3>
                { !isRecording ? (
                  <Button
                    onClick={ startRecording }
                    size="lg"
                    className="h-16 px-8 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Start recording
                    <span className="ml-2 text-sm opacity-75">(Space)</span>
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={ stopRecording } size="lg" variant="destructive" className="h-16 px-8 text-lg">
                      <Square className="w-6 h-6 mr-2" />
                      Stop recording
                      <span className="ml-2 text-sm opacity-75">(Space)</span>
                    </Button>
                    <div className="text-2xl font-mono text-blue-600">{ recordingTime.toFixed(1) }s</div>
                  </div>
                ) }
              </div>
            ) }

            {/* Label Input Section */ }
            {/* { (!currentWord.hasLabel || editingLabel) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{ currentWord.hasLabel ? "Edit Label" : "Add Label" }</h3>
                { !showLabelInput && !editingLabel ? (
                  <Button
                    onClick={ () => setShowLabelInput(true) }
                    variant="outline"
                    size="lg"
                    className="h-16 px-8 text-lg"
                  >
                    <Tag className="w-6 h-6 mr-2" />
                    Add Label
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-left">
                      <Label htmlFor="label-input" className="text-sm font-medium">
                        Definition or description
                      </Label>
                      <Input
                        id="label-input"
                        value={ currentLabel }
                        onChange={ (e) => setCurrentLabel(e.target.value) }
                        placeholder="Enter a definition or description for this word"
                        className="mt-1"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={ editingLabel ? saveLabelEdit : saveLabel } disabled={ !currentLabel.trim() }>
                        Save Label
                      </Button>
                      <Button
                        variant="outline"
                        onClick={ editingLabel ? cancelEditingLabel : () => setShowLabelInput(false) }
                      >
                        Cancel
                      </Button>
                      <Button variant="outline" onClick={ openLabelModal } className="ml-auto">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Edit in Modal
                      </Button>
                    </div>
                  </div>
                ) }
              </div>
            ) } */}

            {/* Show existing label with edit option */ }
            { currentWord.categoryLabel && !editingLabel && !showLabelInput && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Category Label</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-3">{ currentWord.categoryLabel }</p>
                  {/* <div className="flex gap-2">
                    <Button onClick={ startEditingLabel } variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Inline
                    </Button>
                    <Button onClick={ openLabelModal } variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Edit in Modal
                    </Button>
                  </div> */}
                </div>
              </div>
            ) }

            {/* Navigation Controls */ }
            <div className="flex justify-center gap-4">
              <Button
                onClick={ skipToPrevious }
                variant="ghost"
                disabled={ currentWordIndex === 0 }
                className="text-gray-500 hover:text-gray-700"
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
                <span className="ml-2 text-xs opacity-75">(←)</span>
              </Button>
              <Button onClick={ skipToNext } variant="ghost" className="text-gray-500 hover:text-gray-700">
                <SkipForward className="w-4 h-4 mr-2" />
                { currentWordIndex === incompleteWords.length - 1 ? "Finish" : "Next" }
                <span className="ml-2 text-xs opacity-75">(→)</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Footer */ }
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <span className="text-sm font-medium">
              { completedCount } / { words.length } complete
            </span>
          </div>
          <Progress value={ progressPercentage } className="h-2" />
        </div>
      </div>

      {/* Label Editing Modal */ }
      {/* { isLabelModalOpen && currentWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Label</h3>
              <Button variant="ghost" size="sm" onClick={ () => setIsLabelModalOpen(false) }>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Word</Label>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{ currentWord.lemma }</p>
              </div>

              <div>
                <Label htmlFor="modal-label-input" className="text-sm font-medium text-gray-700">
                  Definition or Description
                </Label>
                <textarea
                  id="modal-label-input"
                  value={ currentLabel }
                  onChange={ (e) => setCurrentLabel(e.target.value) }
                  placeholder="Enter a detailed definition or description for this word"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={ 5 }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a clear, concise definition that would help others understand this word.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={ () => setIsLabelModalOpen(false) }>
                  Cancel
                </Button>
                <Button onClick={ saveLabelModal } disabled={ !currentLabel.trim() }>
                  Save Label
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) } */}

      {/* Keyboard Shortcuts Help Modal */ }
      { showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <Button variant="ghost" size="sm" onClick={ () => setShowKeyboardHelp(false) }>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Start/Stop Recording</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>Next Word</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd>
              </div>
              <div className="flex justify-between">
                <span>Previous Word</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd>
              </div>
              <div className="flex justify-between">
                <span>Show/Hide Help</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+H</kbd>
              </div>
            </div>
          </div>
        </div>
      ) }

      {/* Hidden audio element for playback */ }
      <audio ref={ audioRef } style={ { display: "none" } } />
    </div>
  )
}
