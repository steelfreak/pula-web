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
import { GlossWithSense, Language, LexemeDetailResult } from "@/lib/types/api";
// import ContributeModal from "@/components/contribute-audio-modal";
import ContributeAudioModal from "@/components/contribute-audio-modal";
import ContributeLabelModal from "@/components/contribute-label-modal";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const resolvedParams = use(params);
  const lexemeId = decodeURIComponent(resolvedParams.query);
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
    getLanguages,
    setSelectedTargetLanguage1,
    setSelectedTargetLanguage2,
    query,
  } = useApiWithStore();

  const [sourceLexemeDetails, setSourceLexemeDetails] = useState<
    GlossWithSense[]
  >([]);
  const [target1LexemeDetails, setTarget1LexemeDetails] = useState<
    GlossWithSense[]
  >([]);
  const [target2LexemeDetails, setTarget2LexemeDetails] = useState<
    GlossWithSense[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [singleLexemeObj, setSingleLexemeObj] = useState<any>(null);
  const areLanguagesSelected =
    selectedSourceLanguage &&
    (selectedTargetLanguage1 || selectedTargetLanguage2);
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [open, setOpen] = useState(false);
  const [contributingLanguage, setContributingLanguage] = useState<Language | null>(null);
  const [contributingType, setContributingType] = useState<"label" | "audio" | null>(null);

  // const handleSearch = useCallback(
  //   async (searchQuery: string) => {
  //     return;
  //     if (!selectedSourceLanguage) return;

  //     try {
  //       await searchLexemes({
  //         ismatch: 0,
  //         search: searchQuery,
  //         src_lang: selectedSourceLanguage.lang_code,
  //       });
  //     } catch (error) {
  //       console.error("Search failed:", error);
  //     }
  //   },
  //   [selectedSourceLanguage?.lang_code]
  // );

  useEffect(() => {
    getLanguages();
  }, []);

  // Search for lexemes when component mounts or query changes
  // useEffect(() => {
  //   if (query && selectedSourceLanguage?.lang_code) {
  //     console.log(">>>> query", query);
  //     handleSearch(query);
  //   }
  // }, [query, selectedSourceLanguage?.lang_code]);

  useEffect(() => {
    if (clickedLexeme && clickedLexeme.id) {
      if (clickedLexeme.id !== lexemeId) {
        router.push(`/results/${encodeURIComponent(clickedLexeme.id)}`);
      }
      handleGetLexemeDetails();
    }
  }, [clickedLexeme]);

  useEffect(() => {
    if (!selectedLexeme || !selectedLexeme.lexeme || !selectedLexeme.glosses) {
      return;
    }

    setSingleLexemeObj(selectedLexeme.lexeme);
    setSourceLexemeDetails(
      selectedLexeme.glosses.filter(
        (gloss: GlossWithSense) =>
          gloss.gloss.language === selectedSourceLanguage?.lang_code
      )
    );
    setTarget1LexemeDetails(
      selectedLexeme.glosses.filter(
        (gloss: GlossWithSense) =>
          gloss.gloss.language === selectedTargetLanguage1?.lang_code
      )
    );
    setTarget2LexemeDetails(
      selectedLexeme.glosses.filter(
        (gloss: GlossWithSense) =>
          gloss.gloss.language === selectedTargetLanguage2?.lang_code
      )
    );
  }, [selectedLexeme]);

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
      await getLexemeDetails();
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

  const handleContribute = (type: "label" | "audio", language: Language | null) => {
    if (!language) {
      return;
    }
    setOpen(true);
    setContributingLanguage(language);
    setContributingType(type);
  };

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
          </div>

          {/* Search Interface */}
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
                {isLoadingDetails && (
                  <div className="text-center py-8">
                    <p style={{ color: "#72777d" }}>Loading details...</p>
                  </div>
                )}
                <LexemeDetailResultComponent
                  glossesWithSense={sourceLexemeDetails}
                  lexemeDetail={singleLexemeObj}
                  title={
                    selectedSourceLanguage?.lang_label || "Source Language"
                  }
                  onContribute={() => handleContribute(selectedSourceLanguage)}
                />
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
                {isLoadingDetails && (
                  <div className="text-center py-8">
                    <p style={{ color: "#72777d" }}>Loading details...</p>
                  </div>
                )}
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
                    <LexemeDetailResultComponent
                      glossesWithSense={target1LexemeDetails}
                      title={selectedTargetLanguage1?.lang_label || "Target 1"}
                      onContribute={(type) => handleContribute(type, selectedTargetLanguage1)}
                    />
                  </TabsContent>

                  <TabsContent value="target2" className="mt-4">
                    <LexemeDetailResultComponent
                      glossesWithSense={target2LexemeDetails}
                      title={selectedTargetLanguage2?.lang_label || "Target 2"}
                      onContribute={(type) => handleContribute(type, selectedTargetLanguage2)}
                    />
                  </TabsContent>
                </Tabs>
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
      <ContributeAudioModal open={contributingType === "audio" && open ? true : false} onOpenChange={setOpen} language={contributingLanguage} />
      <ContributeLabelModal open={contributingType === "label" && open ? true : false} onOpenChange={setOpen} language={contributingLanguage} />
      {/* <Toaster /> */}
    </div>
  );
}
