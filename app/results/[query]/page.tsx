"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import ResultsSearchInterface from "@/components/results-search-interface";
import LexemeDetailResultComponent from "@/components/lexeme-detail-result";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { useToast } from "@/components/ui/use-toast";
import SearchInput from "@/components/search-input";
import LanguageSelect from "@/components/language-select";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const resolvedParams = use(params);
  // const query = decodeURIComponent(resolvedParams.query);
  const router = useRouter();
  const { toast } = useToast();
  const {
    searchLexemes,
    getLexemeDetails,
    lexemes,
    selectedLexeme,
    lexemeLoading,
    lexemeError,
    selectedSourceLanguage,
    selectedTargetLanguage1,
    selectedTargetLanguage2,
    clickedLexeme,
    languages,
    setSelectedSourceLanguage,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    query,
  } = useApiWithStore();

  const [sourceLexemeDetails, setSourceLexemeDetails] = useState<any>(null);
  const [target1LexemeDetails, setTarget1LexemeDetails] = useState<any>(null);
  const [target2LexemeDetails, setTarget2LexemeDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [singleLexemeObj, setSingleLexemeObj] = useState<any>(null);
  const areLanguagesSelected =
    selectedSourceLanguage &&
    (selectedTargetLanguage1 || selectedTargetLanguage2);
  const [searchQuery, setSearchQuery] = useState(query || "");

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      return;
      if (!selectedSourceLanguage) return;

      try {
        await searchLexemes({
          ismatch: 0,
          search: searchQuery,
          src_lang: selectedSourceLanguage.lang_code,
        });
      } catch (error) {
        console.error("Search failed:", error);
      }
    },
    [selectedSourceLanguage?.lang_code]
  );

  // Search for lexemes when component mounts or query changes
  // useEffect(() => {
  //   if (query && selectedSourceLanguage?.lang_code) {
  //     console.log(">>>> query", query);
  //     handleSearch(query);
  //   }
  // }, [query, selectedSourceLanguage?.lang_code]);

  useEffect(() => {
    console.log("clickedLexeme", clickedLexeme);
    if (clickedLexeme && clickedLexeme.id) {
      router.push(`/results/${encodeURIComponent(clickedLexeme.id)}`);
      handleGetLexemeDetails();
    }
  }, [clickedLexeme]);

  const handleGetLexemeDetails = useCallback(async () => {
    if (
      !selectedSourceLanguage ||
      (!selectedTargetLanguage1 && !selectedTargetLanguage2)
    ) {
      toast({
        title: "Languages required",
        description:
          "Please select source and target languages to get details.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingDetails(true);
    try {
      const details = await getLexemeDetails();
      console.log(">>>> <<<<< details", details);
      const detailObj = details[0];
      setSingleLexemeObj(detailObj.lexeme);
      setSourceLexemeDetails(
        detailObj.glosses.find(
          (gloss: any) =>
            gloss.gloss.language === selectedSourceLanguage?.lang_code
        )
      );
      setTarget1LexemeDetails(
        detailObj.glosses.find(
          (gloss: any) =>
            gloss.gloss.language === selectedTargetLanguage1?.lang_code
        )
      );
      setTarget2LexemeDetails(
        detailObj.glosses.find(
          (gloss: any) =>
            gloss.gloss.language === selectedTargetLanguage2?.lang_code
        )
      );

      console.log({
        detailObj,
        singleLexemeObj,
        sourceLexemeDetails,
        target1LexemeDetails,
        target2LexemeDetails,
      });
      return;

      // For now, we'll use the first result as source and target details
      if (details && details.length > 0) {
        setSourceLexemeDetails(details[0]);
        if (details.length > 1) {
          setTarget1LexemeDetails(details[1]);
        }
        if (details.length > 2) {
          setTarget2LexemeDetails(details[2]);
        }
      }
    } catch (error) {
      console.error("Failed to get lexeme details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [
    selectedSourceLanguage?.lang_code,
    selectedTargetLanguage1?.lang_code,
    selectedTargetLanguage2?.lang_code,
    getLexemeDetails,
  ]);

  // Auto-select first lexeme if available
  // useEffect(() => {
  //   if (lexemes && lexemes.length > 0 && !sourceLexemeDetails) {
  //     handleGetLexemeDetails(lexemes[0].id);
  //   }
  // }, [lexemes, sourceLexemeDetails, handleGetLexemeDetails]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#ffffff" }}
    >
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Title */}
          <div className="mb-8">
            <h1
              className="text-2xl font-normal mb-4"
              style={{ color: "#222222" }}
            >
              Translation Results
            </h1>
            {/* <p className="max-w-2xl" style={{ color: "#72777d" }}>
              Search and compare translations across multiple languages.
            </p> */}
          </div>

          {/* Search Interface */}
          {/* <ResultsSearchInterface
            initialQuery={query}
            onSearch={handleSearch}
          /> */}

          <div className="mb-8">
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LanguageSelect
                  value={selectedSourceLanguage?.lang_code || ""}
                  onChange={(langCode) => {
                    const language = languages.find(
                      (lang) => lang.lang_code === langCode
                    );
                    setSelectedSourceLanguage(language || null);
                  }}
                  placeholder="Select source language"
                  label="Source Language"
                />
                <LanguageSelect
                  value={selectedTargetLanguage1?.lang_code || ""}
                  onChange={(langCode) => {
                    const language = languages.find(
                      (lang) => lang.lang_code === langCode
                    );
                    setSelectedTargetLanguage1(language || null);
                  }}
                  placeholder="Select target language 1"
                  label="Target Language 1"
                />
                <LanguageSelect
                  value={selectedTargetLanguage2?.lang_code || ""}
                  onChange={(langCode) => {
                    const language = languages.find(
                      (lang) => lang.lang_code === langCode
                    );
                    setSelectedTargetLanguage2(language || null);
                  }}
                  placeholder="Select target language 2"
                  label="Target Language 2"
                />
              </div>
            </div>

            <SearchInput
              disabled={!areLanguagesSelected}
              onSearch={(v) => null}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Results Section */}
          {/* {lexemes && lexemes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4" style={{ color: "#222222" }}>
                Search Results for "{query}"
              </h2>
              <div className="space-y-2">
                {lexemes.map((lexeme) => (
                  <div 
                    key={lexeme.id}
                    className="p-3 border rounded cursor-pointer transition-colors"
                    style={{ 
                      backgroundColor: "#f8f9fa", 
                      borderColor: "#a2a9b1",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e9ecef"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                    onClick={() => handleGetLexemeDetails(lexeme.id)}
                  >
                    <h3 className="font-medium" style={{ color: "#222222" }}>
                      {lexeme.label}
                    </h3>
                    <p className="text-sm" style={{ color: "#72777d" }}>
                      {lexeme.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Translation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Column 1: Source Language Results */}
            <div className="lg:col-span-2">
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: "#222222" }}
              >
                Source Language (
                {selectedSourceLanguage?.lang_label || "Not selected"})
              </h3>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #a2a9b1",
                }}
              >
                {isLoadingDetails ? (
                  <div className="text-center py-8">
                    <p style={{ color: "#72777d" }}>Loading details...</p>
                  </div>
                ) : sourceLexemeDetails ? (
                  <LexemeDetailResultComponent
                    data={sourceLexemeDetails}
                    lexeme={singleLexemeObj}
                    glosses={sourceLexemeDetails}
                  />
                ) : (
                  <LexemeDetailResultComponent
                    placeholder={true}
                    placeholderType="source"
                  />
                )}
              </div>
            </div>

            {/* Column 2: Target Languages Results */}
            <div className="lg:col-span-3">
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: "#222222" }}
              >
                Target Languages
              </h3>

              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #a2a9b1",
                }}
              >
                {isLoadingDetails ? (
                  <div className="text-center py-8">
                    <p style={{ color: "#72777d" }}>Loading details...</p>
                  </div>
                ) : (
                  <Tabs defaultValue="target1" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="target1">
                        {selectedTargetLanguage1?.lang_label || "Target 1"}
                      </TabsTrigger>
                      <TabsTrigger value="target2">
                        {selectedTargetLanguage2?.lang_label || "Target 2"}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="target1" className="mt-4">
                      {target1LexemeDetails ? (
                        <LexemeDetailResultComponent
                          data={target1LexemeDetails}
                          // lexeme={singleLexemeObj}
                          glosses={target1LexemeDetails}
                        />
                      ) : (
                        <LexemeDetailResultComponent
                          placeholder={true}
                          placeholderType="target1"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="target2" className="mt-4">
                      {target2LexemeDetails ? (
                        <LexemeDetailResultComponent
                          data={target2LexemeDetails}
                          // lexeme={singleLexemeObj}
                          glosses={target2LexemeDetails}
                        />
                      ) : (
                        <LexemeDetailResultComponent
                          placeholder={true}
                          placeholderType="target2"
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {lexemeError && (
            <div
              className="border rounded p-4 text-center"
              style={{
                backgroundColor: "#fef2f2",
                borderColor: "#fecaca",
              }}
            >
              <p style={{ color: "#dc2626" }}>Error: {lexemeError}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      {/* <Toaster /> */}
    </div>
  );
}
