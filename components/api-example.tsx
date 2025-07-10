'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ApiExample = () => {
  const {
    languages,
    languagesLoading,
    languagesError,
    getLanguages,
    searchResults,
    searchLoading,
    searchError,
    searchLexemes,
    lexemeDetails,
    detailsLoading,
    detailsError,
    getLexemeDetails,
  } = useApi();

  const [searchTerm, setSearchTerm] = useState('ma');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    getLanguages();
  }, [getLanguages]);

  const handleSearch = () => {
    searchLexemes({
      ismatch: 0,
      search: searchTerm,
      src_lang: selectedLanguage,
    });
  };

  const handleGetDetails = (lexemeId: string) => {
    getLexemeDetails({
      id: lexemeId,
      lang_1: 'de',
      lang_2: 'fr',
      src_lang: selectedLanguage,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Helper Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Languages Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Available Languages</h3>
            {languagesLoading && <p>Loading languages...</p>}
            {languagesError && <p className="text-red-500">Error: {languagesError.message}</p>}
            {languages && (
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Badge
                    key={lang.lang_code}
                    variant={selectedLanguage === lang.lang_code ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setSelectedLanguage(lang.lang_code)}
                  >
                    {lang.lang_label} ({lang.lang_code})
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Search Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Search Lexemes</h3>
            <div className="flex gap-2 mb-4">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term"
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {searchError && <p className="text-red-500">Error: {searchError.message}</p>}
            {searchResults && (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <Card key={result.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{result.label}</h4>
                        <p className="text-sm text-gray-600">{result.description}</p>
                        <p className="text-xs text-gray-500">ID: {result.id}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleGetDetails(result.id)}
                        disabled={detailsLoading}
                      >
                        Get Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Lexeme Details</h3>
            {detailsLoading && <p>Loading details...</p>}
            {detailsError && <p className="text-red-500">Error: {detailsError.message}</p>}
            {lexemeDetails && (
              <div className="space-y-4">
                {lexemeDetails.map((detail, index) => (
                  <Card key={index} className="p-4">
                    <div className="mb-4">
                      <h4 className="font-medium">Lexeme: {detail.lexeme.id}</h4>
                      <p className="text-sm text-gray-600">
                        Category: {detail.lexeme.lexicalCategoryLabel}
                      </p>
                      {detail.lexeme.image && (
                        <img
                          src={detail.lexeme.image}
                          alt="Lexeme"
                          className="w-32 h-32 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Glosses:</h5>
                      <div className="space-y-2">
                        {detail.glosses.map((glossWithSense, glossIndex) => (
                          <div key={glossIndex} className="p-2 bg-gray-50 rounded">
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
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 