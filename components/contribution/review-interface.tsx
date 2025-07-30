"use client"

import { useState, useRef, useEffect } from "react"
import { api } from "@/lib/api"
import type { AddAudioTranslationRequest } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Play, Pause, Trash2, Download, Upload, Keyboard, X } from "lucide-react"
import { useApiWithStore } from "@/hooks/useApiWithStore";
import type { RecordingData } from '@/types/recording'

interface ReviewInterfaceProps {
  recordings: RecordingData[]
  onSubmit: () => void
}

export function ReviewInterface({ recordings, onSubmit }: ReviewInterfaceProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { addAudioTranslation } = useApiWithStore();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [audioElements] = useState<{ [key: number]: HTMLAudioElement }>({})
  const [deletedIndices, setDeletedIndices] = useState<number[]>([])
  const [selectedRecordings, setSelectedRecordings] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const recordedItems = recordings.filter((r) => r.isRecorded)
  const totalDuration = recordedItems.reduce((sum, r) => sum + (r.duration || 0), 0)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when the review interface is focused
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement?.tagName !== "BODY") {
        return
      }

      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.code) {
        case "Space":
          event.preventDefault()
          if (recordedItems[selectedIndex]?.audioBlob) {
            if (playingIndex === selectedIndex) {
              pausePlayback(selectedIndex)
            } else {
              playRecording(selectedIndex, recordedItems[selectedIndex].audioBlob!)
            }
          }
          break

        case "ArrowDown":
          event.preventDefault()
          if (selectedIndex < recordedItems.length - 1) {
            setSelectedIndex(selectedIndex + 1)
          }
          break

        case "ArrowUp":
          event.preventDefault()
          if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
          }
          break

        case "Delete":
        case "Backspace":
          event.preventDefault()
          deleteRecording(selectedIndex)
          break

        case "Enter":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            onSubmit()
          }
          break

        case "KeyH":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setShowKeyboardHelp(!showKeyboardHelp)
          }
          break

        case "Escape":
          event.preventDefault()
          if (playingIndex !== null) {
            pausePlayback(playingIndex)
          }
          setShowKeyboardHelp(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedIndex, playingIndex, recordedItems, showKeyboardHelp])

  // Focus container on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [])

  const playRecording = (index: number, audioBlob: Blob) => {
    // Stop any currently playing audio
    if (playingIndex !== null && audioElements[playingIndex]) {
      audioElements[playingIndex].pause()
    }

    if (playingIndex === index) {
      setPlayingIndex(null)
      return
    }

    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audioElements[index] = audio

    audio.play()
    setPlayingIndex(index)

    audio.onended = () => {
      setPlayingIndex(null)
      URL.revokeObjectURL(audioUrl)
      delete audioElements[index]
    }
  }

  const pausePlayback = (index: number) => {
    if (audioElements[index]) {
      audioElements[index].pause()
      setPlayingIndex(null)
    }
  }

  const deleteRecording = (index: number) => {
    if (audioElements[index]) {
      audioElements[index].pause()
      delete audioElements[index]
    }
    if (playingIndex === index) {
      setPlayingIndex(null)
    }
    // Adjust selected index if necessary
    if (selectedIndex >= recordedItems.length - 1 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
    // Add index to deleted indices
    setDeletedIndices(prev => [...prev, index])
  }

  const prepareAudioSubmission = (recording: RecordingData): Promise<AddAudioTranslationRequest | null> => {
    if (!recording.audioBlob) return Promise.resolve(null);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const submission: AddAudioTranslationRequest = {
          file_content: base64Data,
          filename: `${recording.lexeme_id}-${recording.lang_label.toLowerCase()}-${recording.lemma}.ogg`,
          formid: recording.formId,
          lang_label: recording.lang_label,
          lang_wdqid: recording.lang_wdqid
        };
        resolve(submission);
      };
      reader.readAsDataURL(recording.audioBlob as Blob);
    });
  }

  const handleSubmitRecordings = async () => {
    try {
      const toSubmit = recordedItems.filter((_, idx) => 
        selectedRecordings.includes(idx) && !deletedIndices.includes(idx)
      );
      
      if (toSubmit.length === 0) {
        console.error('No recordings selected');
        return;
      }

      const submissions: AddAudioTranslationRequest[] = await Promise.all(
        toSubmit.map(async (recording) => {
          let base64Content = recording.file_content;
          
          // If file_content is not available, generate it from audioBlob
          if (!base64Content && recording.audioBlob) {
            base64Content = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve((reader.result as string).split(',')[1]);
              };
              reader.readAsDataURL(recording.audioBlob as Blob);
            });
          }

          if (!base64Content) {
            throw new Error(`Missing audio content for recording ${recording.lemma}`);
          }

          return {
            file_content: base64Content,
            filename: recording.filename || `${recording.lexeme_id}-${recording.lang_code.toLowerCase()}-${recording.lemma}.ogg`,
            formid: recording.formId,
            lang_label: recording.lang_label,
            lang_wdqid: recording.lang_wdqid
          };
        })
      );

      // Submit all recordings in a single request
      await addAudioTranslation(submissions);
      onSubmit();
    } catch (error) {
      console.error('Error submitting recordings:', error);
      // Handle error - show error message to the user
    }
  }

  const toggleRecordingSelection = (index: number) => {
    setSelectedRecordings(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }

  const toggleAllRecordings = () => {
    if (selectedRecordings.length === recordedItems.length) {
      // If all are selected, unselect all
      setSelectedRecordings([]);
    } else {
      // Otherwise, select all non-deleted recordings
      const allIndices = recordedItems
        .map((_, index) => index)
        .filter(index => !deletedIndices.includes(index));
      setSelectedRecordings(allIndices);
    }
  }

  const downloadRecordings = () => {
    // Create a zip file or individual downloads
    console.log("Download recordings")
  }

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col focus:outline-none"
      tabIndex={0}
      role="application"
      aria-label="Review interface with keyboard shortcuts"
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Review Your Recordings</h2>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>{recordedItems.length} recordings</span>
              <span>{selectedRecordings.length} selected</span>
              <span>{totalDuration.toFixed(1)}s total duration</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllRecordings}
              className="text-gray-500 hover:text-gray-700"
            >
              {selectedRecordings.length === recordedItems.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="text-gray-500 hover:text-gray-700"
              title="Show keyboard shortcuts (Ctrl+H)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recordings List */}
      <div className="flex-1 overflow-y-auto p-6">
        {recordedItems.length > 0 ? (
          <div className="space-y-4">
            {recordedItems.map((recording, index) => (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer ${
                  selectedIndex === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedRecordings.includes(index)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRecordingSelection(index);
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        recording.audioBlob && playRecording(index, recording.audioBlob)
                      }}
                      className="w-12 h-12 rounded-full"
                    >
                      {playingIndex === index ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div>
                      <h3 className="font-medium text-gray-900">{recording.lemma}</h3>
                      <p className="text-sm text-gray-500">{recording.duration?.toFixed(1)}s</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRecording(index)
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Pause className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-500">Go back to the Record step to create some recordings.</p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-between">
          <Button variant="outline" onClick={downloadRecordings} disabled={recordedItems.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleSubmitRecordings} disabled={recordedItems.length === 0} className="px-8">
            <Upload className="w-4 h-4 mr-2" />
            Submit Recordings
            <span className="ml-2 text-sm opacity-75">(Ctrl+Enter)</span>
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowKeyboardHelp(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Play/Pause Selected</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>Next Recording</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↓</kbd>
              </div>
              <div className="flex justify-between">
                <span>Previous Recording</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑</kbd>
              </div>
              <div className="flex justify-between">
                <span>Delete Selected</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Del</kbd>
              </div>
              <div className="flex justify-between">
                <span>Submit Recordings</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd>
              </div>
              <div className="flex justify-between">
                <span>Show/Hide Help</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+H</kbd>
              </div>
              <div className="flex justify-between">
                <span>Cancel/Escape</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Use arrow keys to navigate between recordings, then Space to play/pause.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
