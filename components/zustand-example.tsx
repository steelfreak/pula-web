'use client';

import { useEffect } from 'react';
import { useApiWithStore } from '@/hooks/useApiWithStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ZustandExample = () => {
  const {
    // Language store
    languages,
    selectedSourceLanguage,
    selectedTargetLanguage1,
    selectedTargetLanguage2,
    languageLoading,
    languageError,
    getLanguages,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    
    // Lexeme store
    lexemes,
    query,
    selectedLexeme,
    lexemeLoading,
    lexemeError,
    searchLexemes,
    getLexemeDetails,
    setQuery,
    
    // Reset functions
    resetLanguageStore,
    resetLexemeStore,
  } = useApiWithStore();

  useEffect(() => {
    getLanguages();
  }, [getLanguages]);

  const handleSearch = () => {
    if (!selectedSourceLanguage || !query.trim()) return;
    
    searchLexemes({
      ismatch: 0,
      search: query,
      src_lang: selectedSourceLanguage.lang_code,
    });
  };

  const handleGetDetails = (lexemeId: string) => {
    if (!selectedSourceLanguage || !selectedTargetLanguage1 || !selectedTargetLanguage2) {
      alert('Please select all required languages');
      return;
    }
    
    getLexemeDetails({
      id: lexemeId,
      lang_1: selectedTargetLanguage1.lang_code,
      lang_2: selectedTargetLanguage2.lang_code,
      src_lang: selectedSourceLanguage.lang_code,
    });
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
                      <SelectItem key={lang.lang_code} value={lang.lang_code}>
                        {lang.lang_label} ({lang.lang_code})
                        {lang.lang_wd_id && ` - ${lang.lang_wd_id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Language 1 */}
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

              {/* Target Language 2 */}
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