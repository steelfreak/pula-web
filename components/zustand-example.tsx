'use client';

import { useEffect } from 'react';
import { useApiWithStore } from '@/hooks/useApiWithStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


/**
 * Props for the ZustandExample component (receives none directly from parent)
 * @typedef {Object} ZustandExampleProps
 * @property {Object} [className] - Optional Tailwind CSS classes for the container
 */

/**
 * Comprehensive Zustand store example demonstrating language selection, lexeme search, and store debugging.
 * 
 * Features:
 * - Language store management (source + 2 target languages)
 * - Lexeme search with loading states and error handling
 * - Lexeme details display with glosses and media
 * - Store reset functionality
 * - Debug panels for store state inspection
 * 
 * @component
 * @example
 * // Basic usage
 * <ZustandExample />
 * 
 * @example
 * // With custom container styling
 * <div className="max-w-4xl mx-auto">
 *   <ZustandExample />
 * </div>
 * 
 * @returns {JSX.Element} The Zustand store demo interface
 */
export const ZustandExample = () => {
  /**
   * @typedef {Object} Language
   * @property {string} lang_code - Language code (e.g., 'en', 'es')
   * @property {string} lang_label - Human-readable language name
   * @property {string} [lang_wd_id] - Wikidata ID (optional)
   */

  /**
   * @typedef {Object} Lexeme
   * @property {string} id - Unique lexeme identifier
   * @property {string} label - Lexeme display name
   * @property {string} description - Lexeme description
   */

  /**
   * @typedef {Object} LexemeDetails
   * @property {Object} lexeme - Core lexeme data
   * @property {string} lexeme.id - Lexeme ID
   * @property {string} lexeme.lexicalCategoryLabel - POS/category label
   * @property {string} [lexeme.image] - Image URL (optional)
   * @property {Array} glosses - Array of gloss objects with senses
   */


  const {
    // Language store
    /** @type {Language[]} */
    languages,
    /** @type {Language|null} */
    selectedSourceLanguage,
    /** @type {Language|null} */
    selectedTargetLanguage1,
    /** @type {Language|null} */
    selectedTargetLanguage2,
    /** @type {boolean} */
    languageLoading,
    /** @type {string|null} */
    languageError,
    /** @type {() => Promise<void>} */
    getLanguages,
    /** @type {(language: Language|null) => void} */
    setSelectedSourceLanguage,
    /** @type {(language: Language|null) => void} */
    setSelectedTargetLanguage1,
    /** @type {(language: Language|null) => void} */
    setSelectedTargetLanguage2,
    
    // Lexeme store
    /** @type {Lexeme[]} */
    lexemes,
    /** @type {string} */
    query,
    /** @type {LexemeDetails|null} */
    selectedLexeme,
    /** @type {boolean} */
    lexemeLoading,
    /** @type {string|null} */
    lexemeError,
    /** @type {(params: SearchParams) => Promise<void>} */
    searchLexemes,
    /** @type {() => Promise<void>} */
    getLexemeDetails,
    /** @type {(value: string) => void} */
    setQuery,
    
    // Reset functions
    /** @type {() => void} */
    resetLanguageStore,
    /** @type {() => void} */
    resetLexemeStore,
  } = useApiWithStore();


    /**
   * @typedef {Object} SearchParams
   * @property {number} ismatch - Match type (0 = exact?)
   * @property {string} search - Search query string
   * @property {string} src_lang - Source language code
   * @property {boolean} with_sense - Include sense data
   */

  useEffect(() => {
    getLanguages();
  }, [getLanguages]);

  /**
   * Handles lexeme search execution
   * @returns {void}
   */
  const handleSearch = () => {
    if (!selectedSourceLanguage || !query.trim()) return;
    
    searchLexemes({
      ismatch: 0,
      search: query,
      src_lang: selectedSourceLanguage.lang_code,
      with_sense: false,
    });
  };

  /**
   * Fetches detailed lexeme information
   * @param {string} lexemeId - ID of lexeme to fetch details for
   * @returns {void}
   */
  const handleGetDetails = (lexemeId: string) => {
    if (!selectedSourceLanguage || !selectedTargetLanguage1 || !selectedTargetLanguage2) {
      alert('Please select all required languages');
      return;
    }
    
    getLexemeDetails();
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Zustand Store Example</CardTitle>
          <div className="flex gap-2">
            <Button onClick={resetLanguageStore} variant="outline" size="sm">
              Reset Language Store
            </Button>
            <Button onClick={resetLexemeStore} variant="outline" size="sm">
              Reset Lexeme Store
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Language Selection</h3>
            {languageLoading && <p>Loading languages...</p>}
            {languageError && <p className="text-red-500">Error: {languageError}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Base Language */}
              <div>
                <label className="block text-sm font-medium mb-2">Base Language</label>
                <Select
                  value={selectedSourceLanguage?.lang_code || ''}
                  onValueChange={(value) => {
                    const language = languages.find(lang => lang.lang_code === value);
                    setSelectedSourceLanguage(language || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (

                      /**
                       * Language Select Item Props
                       * @param {Object} props - SelectItem props
                       * @param {string} props.key - lang_code
                       * @param {string} props.value - lang_code
                       */
                      <SelectItem key={lang.lang_code} value={lang.lang_code}>
                        {lang.lang_label} ({lang.lang_code})
                        {lang.lang_wd_id && ` - ${lang.lang_wd_id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Language 1 Select - identical structure to Base Language */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Language 1</label>
                <Select
                  value={selectedTargetLanguage1?.lang_code || ''}
                  onValueChange={(value) => {
                    const language = languages.find(lang => lang.lang_code === value);
                    setSelectedTargetLanguage1(language || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.lang_code} value={lang.lang_code}>
                        {lang.lang_label} ({lang.lang_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Language 2 Select - identical structure */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Language 2</label>
                <Select
                  value={selectedTargetLanguage2?.lang_code || ''}
                  onValueChange={(value) => {
                    const language = languages.find(lang => lang.lang_code === value);
                    setSelectedTargetLanguage2(language || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.lang_code} value={lang.lang_code}>
                        {lang.lang_label} ({lang.lang_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Search Lexemes</h3>
            <div className="flex gap-2 mb-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search term"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={lexemeLoading || !selectedSourceLanguage || !query.trim()}
              >
                {lexemeLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {lexemeError && <p className="text-red-500">Error: {lexemeError}</p>}
            {lexemes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Found {lexemes.length} results:</p>
                {lexemes.map((lexeme) => (
                  /**
                   * Lexeme Result Card Props
                   * @param {string} props.key - lexeme.id
                   * @param {string} props.className - "p-3"
                   */
                  <Card key={lexeme.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{lexeme.label}</h4>
                        <p className="text-sm text-gray-600">{lexeme.description}</p>
                        <p className="text-xs text-gray-500">ID: {lexeme.id}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleGetDetails(lexeme.id)}
                        disabled={lexemeLoading}
                      >
                        Get Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Lexeme Details */}
          {selectedLexeme && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selected Lexeme Details</h3>
              <Card className="p-4">
                <div className="mb-4">
                  <h4 className="font-medium">Lexeme: {selectedLexeme.lexeme.id}</h4>
                  <p className="text-sm text-gray-600">
                    Category: {selectedLexeme.lexeme.lexicalCategoryLabel}
                  </p>
                  {selectedLexeme.lexeme.image && (
                    <img
                      src={selectedLexeme.lexeme.image}
                      alt="Lexeme"
                      className="w-32 h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
                <div>
                  <h5 className="font-medium mb-2">Glosses:</h5>
                  <div className="space-y-2">
                    {selectedLexeme.glosses.map((glossWithSense, index) => (
                      /**
                       * Gloss Item Props
                       * @param {number|string} props.key - index
                       * @param {string} props.className - "p-2 bg-gray-50 rounded"
                       */
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">
                          {glossWithSense.gloss.language}: {glossWithSense.gloss.value}
                        </p>
                        {glossWithSense.gloss.audio && (
                          <audio controls className="w-full mt-1">
                            <source src={glossWithSense.gloss.audio} type="audio/ogg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                        <p className="text-xs text-gray-500">
                          Form ID: {glossWithSense.gloss.formId} | Sense ID: {glossWithSense.senseId}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Store State Debug */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Store State Debug</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-3">
                <h4 className="font-medium mb-2">Language Store</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify({
                    languagesCount: languages.length,
                    selectedSourceLanguage: selectedSourceLanguage?.lang_label,
                    selectedTargetLanguage1: selectedTargetLanguage1?.lang_label,
                    selectedTargetLanguage2: selectedTargetLanguage2?.lang_label,
                    loading: languageLoading,
                    error: languageError,
                  }, null, 2)}
                </pre>
              </Card>

              
              /**
               * Language Store Debug Card Props
               * @param {string} props.className - "p-3"
               */
              <Card className="p-3">
                <h4 className="font-medium mb-2">Lexeme Store</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify({
                    lexemesCount: lexemes.length,
                    query,
                    selectedLexemeId: selectedLexeme?.lexeme.id,
                    loading: lexemeLoading,
                    error: lexemeError,
                  }, null, 2)}
                </pre>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 