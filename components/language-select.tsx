"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { useLanguageStore } from "@/lib/stores";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  require?: string;
}

export default function LanguageSelect({
  value,
  onChange,
  placeholder = "Select language",
  label,
  require,
}: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { languages, loading, error } = useLanguageStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (languageCode: string) => {
    onChange(languageCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Filter languages based on search query
  const filteredLanguages = languages.filter(
    (language) =>
      language.lang_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.lang_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the display value (language label) for the selected language code
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedLanguage = languages.find((lang) => lang.lang_code === value);
    return selectedLanguage ? selectedLanguage.lang_label : value;
  };

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "#222222" }}
          aria-required
        >
          {label}
        </label>
      )}
      {require && <span style={{ color: "#f50303" }}>{require}</span>}
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white rounded px-3 py-2 text-left text-sm focus:outline-none transition-colors"
          style={{
            border: `1px solid #a2a9b1`,
            color: value ? "#222222" : "#72777d",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0645ad")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#a2a9b1")}
        >
          <span className="block truncate">{getDisplayValue()}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              style={{ color: "#72777d" }}
            />
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
                <Search
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "#72777d" }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border rounded focus:outline-none"
                  style={{
                    borderColor: "#a2a9b1",
                    color: "#222222",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#0645ad")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#a2a9b1")
                  }
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
              {!loading &&
                !error &&
                filteredLanguages.map((language) => (
                  <button
                    key={language.lang_code}
                    type="button"
                    onClick={() => handleSelect(language.lang_code)}
                    className="w-full text-left px-3 py-2 text-sm focus:outline-none flex items-center justify-between transition-colors"
                    style={{ color: "#222222" }}
                    onMouseEnter={(e) =>(e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span>{language.lang_label}</span>
                    {value === language.lang_code && (
                      <Check className="w-4 h-4" style={{ color: "#0645ad" }} />
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
