"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Trash2, CheckCircle, AlertTriangle, Info, Download, Wand2 } from "lucide-react"
import { validateLabel, type ValidationResult } from "@/utils/label-validation"

interface LexemeWord {
  id: string
  word: string
  hasAudio: boolean
  hasLabel: boolean
  audioBlob?: Blob
  label?: string
  language: string
}

interface BulkLabelOperationsProps {
  isOpen: boolean
  onClose: () => void
  words: LexemeWord[]
  onWordsChange: (words: LexemeWord[]) => void
}

type BulkOperation = "edit" | "delete" | "validate" | "template" | "export"

const labelTemplates = [
  {
    id: "definition",
    name: "Definition Template",
    template: "A {type} that {description}.",
    example: "A professional that provides expert advice on educational matters.",
  },
  {
    id: "description",
    name: "Description Template",
    template: "{Word} refers to {explanation}.",
    example: "Educational consultant refers to a professional who advises on educational policies.",
  },
  {
    id: "category",
    name: "Category Template",
    template: "A type of {category} used for {purpose}.",
    example: "A type of educational program used for immigrant integration.",
  },
]

export function BulkLabelOperations({ isOpen, onClose, words, onWordsChange }: BulkLabelOperationsProps) {
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set())
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation>("edit")
  const [bulkLabelText, setBulkLabelText] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map())
  const [showValidation, setShowValidation] = useState(false)

  const wordsWithLabels = words.filter((word) => word.hasLabel)
  const selectedWords = words.filter((word) => selectedWordIds.has(word.id))

/**
 * Selects or deselects all words that have labels.
 * @param {boolean} checked - Whether to select all (true) or deselect all (false)
 * @sideEffects Updates the selectedWordIds state by setting it to all words with labels or clearing it
 */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWordIds(new Set(wordsWithLabels.map((word) => word.id)))
    } else {
      setSelectedWordIds(new Set())
    }
  }

/**
 * Toggles the selection state of an individual word.
 * @param {string} wordId - The ID of the word to toggle
 * @param {boolean} checked - Whether to select (true) or deselect (false) the word
 * @sideEffects Updates the selectedWordIds state by adding or removing the wordId
 */
  const handleSelectWord = (wordId: string, checked: boolean) => {
    const newSelected = new Set(selectedWordIds)
    if (checked) {
      newSelected.add(wordId)
    } else {
      newSelected.delete(wordId)
    }
    setSelectedWordIds(newSelected)
  }

/**
 * Applies the same label text to all selected words.
 * @sideEffects Updates parent component's words via onWordsChange callback and resets bulkLabelText and selectedWordIds states
 */
  const handleBulkEdit = () => {
    if (!bulkLabelText.trim() || selectedWordIds.size === 0) return

    const updatedWords = words.map((word) => {
      if (selectedWordIds.has(word.id)) {
        return {
          ...word,
          label: bulkLabelText.trim(),
          hasLabel: true,
        }
      }
      return word
    })

    onWordsChange(updatedWords)
    setBulkLabelText("")
    setSelectedWordIds(new Set())
  }

/**
 * Removes labels from all selected words.
 * @sideEffects Updates parent component's words via onWordsChange callback and clears selectedWordIds state
 */
  const handleBulkDelete = () => {
    const updatedWords = words.map((word) => {
      if (selectedWordIds.has(word.id)) {
        return {
          ...word,
          label: undefined,
          hasLabel: false,
        }
      }
      return word
    })

    onWordsChange(updatedWords)
    setSelectedWordIds(new Set())
  }

/**
 * Validates labels for all selected words using the validateLabel utility.
 * @sideEffects Updates validationResults state and sets showValidation state to true
 */
  const handleValidateAll = () => {
    const results = new Map<string, ValidationResult>()

    selectedWords.forEach((word) => {
      if (word.label) {
        results.set(word.id, validateLabel(word.label))
      }
    })

    setValidationResults(results)
    setShowValidation(true)
  }

/**
 * Applies a selected label template to all selected words, replacing placeholders like {Word}.
 * @sideEffects Updates parent component's words via onWordsChange callback and clears selectedWordIds state
 */
  const handleApplyTemplate = () => {
    if (!selectedTemplate || selectedWordIds.size === 0) return

    const template = labelTemplates.find((t) => t.id === selectedTemplate)
    if (!template) return

    const updatedWords = words.map((word) => {
      if (selectedWordIds.has(word.id)) {
        // Simple template application - replace {Word} with the actual word
        let appliedTemplate = template.template.replace("{Word}", word.word)
        appliedTemplate = appliedTemplate.replace("{word}", word.word.toLowerCase())

        return {
          ...word,
          label: appliedTemplate,
          hasLabel: true,
        }
      }
      return word
    })

    onWordsChange(updatedWords)
    setSelectedWordIds(new Set())
  }

/**
 * Exports labels from selected words as a downloadable JSON file.
 * @sideEffects Creates and downloads a JSON blob file named "lexeme-labels.json" containing word, label, and language data
 */
  const handleExportLabels = () => {
    const exportData = selectedWords.map((word) => ({
      word: word.word,
      label: word.label || "",
      language: word.language,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lexeme-labels.json"
    a.click()
    URL.revokeObjectURL(url)
  }

/**
 * Calculates validation summary statistics across all validated words.
 * @returns {{
 *   totalErrors: number - Total number of validation errors
 *   totalWarnings: number - Total number of validation warnings  
 *   totalInfo: number - Total number of info/suggestions
 * }}
 */
  const getValidationSummary = () => {
    let totalErrors = 0
    let totalWarnings = 0
    let totalInfo = 0

    validationResults.forEach((result) => {
      totalErrors += result.errors.length
      totalWarnings += result.warnings.length
      totalInfo += result.info.length
    })

    return { totalErrors, totalWarnings, totalInfo }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <DialogTitle className="text-2xl font-semibold">Bulk Label Operations</DialogTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word Selection */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Select Words</h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedWordIds.size === wordsWithLabels.length && wordsWithLabels.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Select All ({wordsWithLabels.length})
                </Label>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {wordsWithLabels.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {wordsWithLabels.map((word) => (
                    <div key={word.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`word-${word.id}`}
                          checked={selectedWordIds.has(word.id)}
                          onCheckedChange={(checked) => handleSelectWord(word.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{word.word}</div>
                          {word.label && <div className="text-sm text-gray-600 mt-1 truncate">{word.label}</div>}
                          {validationResults.has(word.id) && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Score: {validationResults.get(word.id)?.score}%
                              </Badge>
                              {validationResults.get(word.id)?.errors.length! > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {validationResults.get(word.id)?.errors.length} errors
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No words with labels found</div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {selectedWordIds.size} of {wordsWithLabels.length} words selected
            </div>
          </div>

          {/* Operations Panel */}
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Operation</Label>
              <Select value={selectedOperation} onValueChange={(value) => setSelectedOperation(value as BulkOperation)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edit">Bulk Edit</SelectItem>
                  <SelectItem value="delete">Delete Labels</SelectItem>
                  <SelectItem value="validate">Validate Labels</SelectItem>
                  <SelectItem value="template">Apply Template</SelectItem>
                  <SelectItem value="export">Export Labels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Operation-specific controls */}
            {selectedOperation === "edit" && (
              <div className="space-y-3">
                <Label htmlFor="bulk-label">New Label Text</Label>
                <textarea
                  id="bulk-label"
                  value={bulkLabelText}
                  onChange={(e) => setBulkLabelText(e.target.value)}
                  placeholder="Enter the label text to apply to all selected words"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={4}
                />
                <Button
                  onClick={handleBulkEdit}
                  disabled={!bulkLabelText.trim() || selectedWordIds.size === 0}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Apply to {selectedWordIds.size} words
                </Button>
              </div>
            )}

            {selectedOperation === "delete" && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    This will remove labels from {selectedWordIds.size} selected words. This action cannot be undone.
                  </p>
                </div>
                <Button
                  onClick={handleBulkDelete}
                  disabled={selectedWordIds.size === 0}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedWordIds.size} labels
                </Button>
              </div>
            )}

            {selectedOperation === "validate" && (
              <div className="space-y-3">
                <Button onClick={handleValidateAll} disabled={selectedWordIds.size === 0} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validate {selectedWordIds.size} labels
                </Button>

                {showValidation && validationResults.size > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Validation Summary</h4>
                    <div className="space-y-1 text-sm">
                      {(() => {
                        const summary = getValidationSummary()
                        return (
                          <>
                            {summary.totalErrors > 0 && (
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                {summary.totalErrors} errors found
                              </div>
                            )}
                            {summary.totalWarnings > 0 && (
                              <div className="flex items-center gap-2 text-yellow-600">
                                <AlertTriangle className="w-4 h-4" />
                                {summary.totalWarnings} warnings found
                              </div>
                            )}
                            {summary.totalInfo > 0 && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <Info className="w-4 h-4" />
                                {summary.totalInfo} suggestions
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedOperation === "template" && (
              <div className="space-y-3">
                <Label>Label Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {labelTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplate && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 mb-1">Template:</p>
                    <p className="text-sm font-mono">
                      {labelTemplates.find((t) => t.id === selectedTemplate)?.template}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">Example:</p>
                    <p className="text-sm italic">{labelTemplates.find((t) => t.id === selectedTemplate)?.example}</p>
                  </div>
                )}

                <Button
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplate || selectedWordIds.size === 0}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Apply to {selectedWordIds.size} words
                </Button>
              </div>
            )}

            {selectedOperation === "export" && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Export labels from {selectedWordIds.size} selected words as JSON file.
                  </p>
                </div>
                <Button onClick={handleExportLabels} disabled={selectedWordIds.size === 0} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedWordIds.size} labels
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
