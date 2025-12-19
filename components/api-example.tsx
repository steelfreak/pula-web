'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';

/**
 * Interface defining the parameters for lexeme search
 */
interface SearchParams {
  /** Match type (0 = partial match) */
  ismatch: number;
  /** Search term */
  search: string;
  /** Source language code */
  src_lang: string;
}

/**
 * ApiExample is a comprehensive React component demonstrating the usage of the Lexeme API.
 * It provides an interactive interface to:
 * - Browse available languages
 * - Search for lexemes by term
 * - View detailed information about specific lexemes including glosses and audio
 * 
 * @example
 * ```
 * <ApiExample />
 * ```
 */
export const ApiExample = () => {
  /**
   * Custom hook providing all API functionality and state management
   * @returns Object containing languages, search results, loading states, errors, and API methods
   */
  const {
    /** Array of available languages */
    languages,
    /** Boolean indicating if languages are loading */
    languagesLoading,
    /** Error object for languages API call */
    languagesError,
    /** Function to fetch available languages */
    getLanguages,
    /** Array of search results */
    searchResults,
    /** Boolean indicating if search is in progress */
    searchLoading,
    /** Error object for search API call */
    searchError,
    /** Function to search lexemes */
    searchLexemes,
    /** Array of detailed lexeme information */
    lexemeDetails,
    /** Boolean indicating if details are loading */
    detailsLoading,
    /** Error object for details API call */
    detailsError,
    /** Function to fetch lexeme details */
    getLexemeDetails,
  } = useApi();

  /**
   * Current search term entered by user
   * @default 'ma'
   */
  const [searchTerm, setSearchTerm] = useState('ma');
  
  /**
   * Currently selected language code for search
   * @default 'en'
   */
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  /**
   * Currently active lexeme ID for displaying details
   */
  const [activeLexemeId, setActiveLexemeId] = useState<string | null>(null);

  /**
   * Fetches available languages on component mount
   */
  useEffect(() => {
    getLanguages();
  }, [getLanguages]);

  /**
   * Handles lexeme search with validation
   */
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      searchLexemes({
        ismatch: 0,
        search: searchTerm.trim(),
        src_lang: selectedLanguage,
      } as SearchParams);
    }
  }, [searchLexemes, searchTerm, selectedLanguage]);

  /**
   * Toggles details view for a specific lexeme
   * @param lexemeId - The ID of the lexeme to fetch details for
   */
  const handleGetDetails = useCallback((lexemeId: string) => {
    setActiveLexemeId(prev => prev === lexemeId ? null : lexemeId);
    getLexemeDetails({
      id: lexemeId,
      lang_1: 'de',
      lang_2: 'fr',
      src_lang: selectedLanguage,
    });
  }, [getLexemeDetails, selectedLanguage]);

  /**
   * Filters lexeme details to show only the active lexeme
   */
  const filteredDetails = useMemo(() => {
    return lexemeDetails?.filter(detail => detail.lexeme.id === activeLexemeId) || [];
  }, [lexemeDetails, activeLexemeId]);

  /**
   * Handles Enter key press in search input
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Lexeme API Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Languages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Languages</CardTitle>
            </CardHeader>
            <CardContent>
              {languagesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading languages...
                </div>
              ) : languagesError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">Failed to load languages</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => getLanguages()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {languages?.map((lang) => (
                    <Badge
                      key={lang.lang_code}
                      variant={selectedLanguage === lang.lang_code ? 'default' : 'secondary'}
                      className="cursor-pointer hover:scale-105 transition-transform px-3 py-1"
                      onClick={() => setSelectedLanguage(lang.lang_code)}
                    >
                      {lang.lang_label} ({lang.lang_code})
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Lexemes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter search term (e.g., 'ma')"
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={!searchTerm.trim() || searchLoading}>
                  {searchLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
              
              {searchError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">Search failed: {searchError.message}</p>
                </div>
              )}
              
              {searchResults && searchResults.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{result.label}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {result.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            ID: {result.id}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={activeLexemeId === result.id ? 'default' : 'outline'}
                          onClick={() => handleGetDetails(result.id)}
                          disabled={detailsLoading}
                          className="whitespace-nowrap"
                        >
                          {detailsLoading && activeLexemeId === result.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : 'Details'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {searchResults && searchResults.length === 0 && !searchLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No results found for "{searchTerm}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Section */}
          {filteredDetails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lexeme Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading details...</span>
                  </div>
                ) : detailsError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">Failed to load details</p>
                  </div>
                ) : (
                  filteredDetails.map((detail, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {detail.lexeme.image ? (
                            <img
                              src={detail.lexeme.image}
                              alt="Lexeme"
                              className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xl">{detail.lexeme.id}</h4>
                          <p className="text-muted-foreground">
                            {detail.lexeme.lexicalCategoryLabel}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          Glosses
                        </h5>
                        <div className="space-y-3">
                          {detail.glosses.map((glossWithSense, glossIndex) => (
                            <Card key={glossIndex} className="overflow-hidden">
                              <div className="p-4">
                                <div className="font-medium mb-2">
                                  {glossWithSense.gloss.language}:{" "}
                                  <span className="font-bold text-lg">
                                    {glossWithSense.gloss.value}
                                  </span>
                                </div>
                                {glossWithSense.gloss.audio && (
                                  <div className="mb-3">
                                    <audio 
                                      controls 
                                      className="w-full rounded-lg border"
                                      preload="metadata"
                                    >
                                      <source src={glossWithSense.gloss.audio} type="audio/ogg" />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                  <span>Form ID: {glossWithSense.gloss.formId}</span>
                                  <span>Sense ID: {glossWithSense.senseId}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};