"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useLanguageStore } from "@/lib/stores"
import { useApiWithStore } from "@/hooks/useApiWithStore"


interface LanguageSelectionProps {
  value: string
  onChange: (primary: string) => void
  placeholder?: string
  label?: string
}



export function LanguageSelection({ value, onChange, placeholder = "Select language", label }: LanguageSelectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { getLanguages } = useApiWithStore()
  const { languages, loading, error } = useLanguageStore()

  useEffect(() => {
    getLanguages()
  }, [getLanguages])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSelect = (languageCode: string) => {
    onChange(languageCode)
    setIsOpen(false)
    setSearchQuery("")
  }

  const filteredLanguages = languages.filter((language: { lang_label: string; lang_code: string }) =>
    language.lang_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.lang_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDisplayValue = () => {
    if (!value) return placeholder
    const selectedLanguage = languages.find((lang: { lang_code: string; lang_label: string }) => lang.lang_code === value)
    return selectedLanguage ? selectedLanguage.lang_label : value
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Language Selection</h2>
        <p className="text-gray-600">
          Choose your primary language for word generation and target languages for contributions
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-medium">Primary Language</Label>
          <p className="text-sm text-gray-600 mb-3">
            This language will be used to source words and lexemes for contribution
          </p>
          <div className="relative" ref={selectRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white rounded px-3 py-2 text-left text-sm focus:outline-none transition-colors h-12 border"
              style={{
                border: `1px solid #a2a9b1`,
                color: value ? "#222222" : "#72777d",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#0645ad")}
              onBlur={e => (e.currentTarget.style.borderColor = "#a2a9b1")}
            >
              <span className="block truncate">{getDisplayValue()}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: "#72777d" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </button>
            {isOpen && (
              <div
                className="absolute z-10 mt-1 w-full bg-white rounded shadow-lg max-h-60 overflow-auto"
                style={{ border: `1px solid #a2a9b1` }}
              >
                {/* Search Input */}
                <div className="p-2 border-b" style={{ borderColor: "#e9ecef" }}>
                  <div className="relative">
                    <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "#72777d" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search languages..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border rounded focus:outline-none"
                      style={{
                        borderColor: "#a2a9b1",
                        color: "#222222",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#0645ad")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#a2a9b1")}
                    />
                  </div>
                </div>
                {/* Language Options */}
                <div className="max-h-48 overflow-auto">
                  {loading && (
                    <div className="px-3 py-2 text-sm" style={{ color: "#72777d" }}>
                      Loading languages...
                    </div>
                  )}
                  {error && (
                    <div className="px-3 py-2 text-sm" style={{ color: "#d73a49" }}>
                      Error: {error}
                    </div>
                  )}
                  {!loading && !error && filteredLanguages.length === 0 && (
                    <div className="px-3 py-2 text-sm" style={{ color: "#72777d" }}>
                      No languages found
                    </div>
                  )}
                  {!loading && !error && filteredLanguages.map((language: { lang_code: string; lang_label: string; flag?: string }) => (
                    <button
                      key={language.lang_code}
                      type="button"
                      onClick={() => handleSelect(language.lang_code)}
                      className="w-full text-left px-3 py-2 text-sm focus:outline-none flex items-center justify-between transition-colors"
                      style={{ color: "#222222" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span className="flex items-center gap-2">
                        {language.flag && <span>{language.flag}</span>}
                        <span>{language.lang_label}</span>
                      </span>
                      {value === language.lang_code && (
                        <svg className="w-4 h-4" style={{ color: "#0645ad" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
