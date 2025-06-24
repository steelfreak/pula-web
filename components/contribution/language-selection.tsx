"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface LanguageSelectionProps {
  onLanguageChange: (primary: string, targets: string[]) => void
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
]

export function LanguageSelection({ onLanguageChange }: LanguageSelectionProps) {
  const [primaryLanguage, setPrimaryLanguage] = useState("")
  const [targetLanguages, setTargetLanguages] = useState<string[]>([])
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("")

  const handlePrimaryLanguageChange = (value: string) => {
    setPrimaryLanguage(value)
    onLanguageChange(value, targetLanguages)
  }

  const addTargetLanguage = () => {
    if (selectedTargetLanguage && !targetLanguages.includes(selectedTargetLanguage)) {
      const newTargets = [...targetLanguages, selectedTargetLanguage]
      setTargetLanguages(newTargets)
      setSelectedTargetLanguage("")
      onLanguageChange(primaryLanguage, newTargets)
    }
  }

  const removeTargetLanguage = (languageCode: string) => {
    const newTargets = targetLanguages.filter((lang) => lang !== languageCode)
    setTargetLanguages(newTargets)
    onLanguageChange(primaryLanguage, newTargets)
  }

  const getLanguageDisplay = (code: string) => {
    const lang = languages.find((l) => l.code === code)
    return lang ? `${lang.flag} ${lang.name}` : code
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Language Selection</h2>
        <p className="text-gray-600">
          Choose your primary language for word generation and target languages for contributions
        </p>
      </div>

      {/* Primary Language Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-medium">Primary Language</Label>
          <p className="text-sm text-gray-600 mb-3">
            This language will be used to source words and lexemes for contribution
          </p>
          <Select value={primaryLanguage} onValueChange={handlePrimaryLanguageChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select primary language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Target Languages Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-medium">Target Languages</Label>
          <p className="text-sm text-gray-600 mb-3">Languages in which you will add audio recordings and labels</p>

          <div className="flex gap-2 mb-4">
            <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
              <SelectTrigger className="flex-1 h-12">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {languages
                  .filter((lang) => !targetLanguages.includes(lang.code))
                  .map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={addTargetLanguage} disabled={!selectedTargetLanguage} className="h-12 px-4">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Target Languages */}
          {targetLanguages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Selected Target Languages:</Label>
              <div className="flex flex-wrap gap-2">
                {targetLanguages.map((langCode) => (
                  <Badge key={langCode} variant="secondary" className="px-3 py-1 text-sm">
                    {getLanguageDisplay(langCode)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTargetLanguage(langCode)}
                      className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {primaryLanguage && targetLanguages.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Configuration Summary</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Primary Language:</strong> {getLanguageDisplay(primaryLanguage)}
              <span className="text-blue-600"> (source for word generation)</span>
            </p>
            <p>
              <strong>Target Languages:</strong> {targetLanguages.map(getLanguageDisplay).join(", ")}
              <span className="text-blue-600"> (for audio and label contributions)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
