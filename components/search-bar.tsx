"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"

/**
 * Mock data for search suggestions - predefined list of common search terms.
 * @type {readonly string[]}
 */
const SUGGESTIONS = [
  "apple",
  "banana",
  "orange",
  "pineapple",
  "grape",
  "watermelon",
  "strawberry",
  "blueberry",
  "mango",
  "peach",
  "apricot",
  "avocado",
  "hello",
  "world",
  "translate",
  "language",
  "dictionary",
  "vocabulary",
] as const

/**
 * SearchBar component - A fully-featured search input with autocomplete suggestions.
 * 
 * Features:
 * - Real-time filtering of suggestions as user types
 * - Click outside to close suggestions
 * - Keyboard focus management
 * - Custom hover animations and styling
 * - Form submission handling
 * 
 * @component
 * @example
 * ```
 * <SearchBar />
 * ```
 * 
 * @param {object} props - Component props
 * @param {object} [props.className] - Optional Tailwind CSS classes for the wrapper div
 * @returns {JSX.Element} Search bar with dropdown suggestions
 */
export default function SearchBar(
  /** @type {{}} Empty props object - this is a self-contained component with no external props */
  {}
): JSX.Element {
  /** Current search query string */
  const [query, setQuery] = useState("")
  /** Filtered suggestions array based on current query */
  const [suggestions, setSuggestions] = useState<string[]>([])
  /** Controls visibility of the suggestions dropdown */
  const [showSuggestions, setShowSuggestions] = useState(false)
  /** Reference to the input element for focus management */
  const inputRef = useRef<HTMLInputElement>(null)
  /** Reference to the suggestions dropdown for click-outside detection */
  const suggestionsRef = useRef<HTMLDivElement>(null)

  /**
   * Filters suggestions based on current query input.
   * Updates suggestions state with up to 6 matching items.
   */
  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([])
      return
    }

    const filteredSuggestions = SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6) // Limit to 6 suggestions

    setSuggestions(filteredSuggestions)
  }, [query])

  /**
   * Handles clicks outside the search bar to close suggestions dropdown.
   * Attaches global mousedown listener with cleanup on unmount.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  /**
   * Handles input changes - updates query state and shows suggestions.
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }

  /**
   * Handles suggestion item clicks - sets query and closes dropdown.
   * @param suggestion - Selected suggestion string
   */
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  /**
   * Handles form submission - closes dropdown and logs search query.
   * Ready for integration with actual search API.
   * @param e - Form submit event
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    console.log("Searching for:", query)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="flex shadow-lg">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type your word here"
          className="flex-1 p-4 focus:outline-none focus:ring-2 text-lg"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#CBD5E1",
            border: "1px solid",
            focusRingColor: "#336699",
          }}
        />
        <button
          type="submit"
          className="px-8 py-4 transition-colors font-medium text-white"
          style={{ backgroundColor: "#FF6F00" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E65100"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FF6F00"
          }}
        >
          Search
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 mt-1 shadow-lg z-30 rounded"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#CBD5E1",
            border: "1px solid",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 cursor-pointer border-b last:border-b-0 flex items-center transition-colors"
              style={{ borderColor: "#CBD5E1" }}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0F8FF"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              <Search className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-gray-700">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
