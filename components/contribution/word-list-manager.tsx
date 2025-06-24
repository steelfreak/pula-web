"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WordListManagerProps {
  words: string[]
  onWordsChange: (words: string[]) => void
  onOpenWikimediaModal: () => void
}

export function WordListManager({ words, onWordsChange, onOpenWikimediaModal }: WordListManagerProps) {
  const [inputValue, setInputValue] = useState("")

  const handleAddWords = () => {
    if (!inputValue.trim()) return

    // Split by # for multiple words, then clean and filter
    const newWords = inputValue
      .split("#")
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .filter((word) => !words.includes(word)) // Avoid duplicates

    if (newWords.length > 0) {
      onWordsChange([...words, ...newWords])
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddWords()
    }
  }

  const handleDeleteWord = (index: number) => {
    const newWords = words.filter((_, i) => i !== index)
    onWordsChange(newWords)
  }

  const handleClearAll = () => {
    onWordsChange([])
  }

  const handleRemoveRecorded = () => {
    // This would typically filter out words that have been recorded
    // For now, we'll just show a placeholder behavior
    console.log("Remove recorded words functionality")
  }

  const handleShareList = () => {
    // This would typically open a share dialog or copy to clipboard
    if (words.length > 0) {
      navigator.clipboard.writeText(words.join(", "))
      console.log("Word list copied to clipboard")
    }
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Word List</h2>
        {words.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {words.length} word{words.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
        {/* Main word list area */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Input Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex gap-2 mb-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type here the word too record"
                className="flex-1 h-12 text-base focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleAddWords} disabled={!inputValue.trim()} className="h-12 px-4">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                To differentiate between two homographs, specify the meaning in parentheses, for example "son
                (relationship)" vs "son (plural of son)".
              </p>
              <p>To add several words at once, separate them with #, for example "big#house#orange".</p>
            </div>
          </div>

          {/* Word List Display */}
          <div className="flex-1 min-h-0">
            {words.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">Your Words</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-gray-800 font-medium">{word}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWord(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No words yet</h3>
                  <p className="text-gray-500 mb-4">Add words manually or use a word generator</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRemoveRecorded}
              disabled={words.length === 0}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Remove word already recorded
            </Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={words.length === 0} className="flex-1">
              Clear
            </Button>
          </div>
        </div>

        {/* Word generators sidebar */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Try out a word generator</h3>
          <div className="space-y-3">
            <WordGeneratorButton
              icon="📝"
              label="Local List"
              description="Use your saved word lists"
              onClick={() => console.log("Local List clicked")}
            />
            <WordGeneratorButton
              icon="🎯"
              label="Nearby"
              description="Words from your location"
              onClick={() => console.log("Nearby clicked")}
            />
            <WordGeneratorButton
              icon="W"
              label="Wikimedia Category"
              description="Words from Wikipedia categories"
              onClick={onOpenWikimediaModal}
              iconBg="bg-gray-100"
            />
            <WordGeneratorButton
              icon="🔧"
              label="External Tools"
              description="Import from external sources"
              onClick={() => console.log("External Tools clicked")}
            />
            <WordGeneratorButton
              icon="📚"
              label="Wikidata Lexeme"
              description="Lexical data from Wikidata"
              onClick={() => console.log("Wikidata Lexeme clicked")}
              iconBg="bg-red-100"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleShareList}
            disabled={words.length === 0}
            className="w-full mt-6 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share List
          </Button>
        </div>
      </div>
    </div>
  )
}

interface WordGeneratorButtonProps {
  icon: string
  label: string
  description: string
  onClick: () => void
  iconBg?: string
}

function WordGeneratorButton({ icon, label, description, onClick, iconBg = "bg-blue-100" }: WordGeneratorButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full h-auto p-4 justify-start hover:bg-gray-50 hover:border-gray-300"
    >
      <div className="flex items-start gap-3 w-full">
        <div className={cn("w-8 h-8 rounded flex items-center justify-center text-sm font-bold flex-shrink-0", iconBg)}>
          {icon}
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
      </div>
    </Button>
  )
}
