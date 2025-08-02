"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Mic, Tag, Settings, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { validateLabel, getQualityBadgeColor } from "@/utils/label-validation";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";

interface LexemeWord {
  lexeme_id: string;
  formId: string;
  lemma: string;
  audioBlob?: Blob;
  hasAudio: boolean;
  hasLabel?: boolean;
  _fromApi?: boolean;
  word?: string;
  categoryId: string;
  categoryLabel: string;
  sense_id: string;
  lang_label: string;
  lang_wdqid: string;
}

interface EnhancedWordListManagerProps {
  words: LexemeWord[];
  onWordsChange: (words: LexemeWord[]) => void;
  onOpenWikimediaModal: () => void;
  loadingWords?: boolean;
}

export function EnhancedWordListManager({
  words,
  onWordsChange,
  onOpenWikimediaModal,
  searchQuery,
  setSearchQuery,
  onSearch,
  loadingWords,
}: EnhancedWordListManagerProps & {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSearch: (v: string) => void;
}) {
  const [showWordGenerators, setShowWordGenerators] = useState(false);
  const [isBulkOperationsOpen, setIsBulkOperationsOpen] = useState(false);

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState("");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [modalEditingWord, setModalEditingWord] = useState<LexemeWord | null>(
    null
  );

  // Filter to only show incomplete words
  const incompleteWords = words.filter((word: LexemeWord) => !word.hasAudio);

  const handleDeleteWord = (id: string) => {
    const newWords = words.filter((w) => w.lexeme_id !== id);
    onWordsChange(newWords);
  };

  const handleClearAll = () => {
    onWordsChange([]);
  };

  const getWordStats = () => {
    const total = incompleteWords.length;
    const needsAudio = incompleteWords.filter((w) => !w.hasAudio).length;
    const needsLabel = incompleteWords.filter((w) => !w.hasLabel).length;
    const needsBoth = incompleteWords.filter(
      (w) => !w.hasAudio && !w.hasLabel
    ).length;

    return { total, needsAudio, needsLabel, needsBoth };
  };

  const stats = getWordStats();

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Lexeme Management</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>{stats.total} items need work</span>
            <span className="text-orange-600">
              {stats.needsAudio} need audio
            </span>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <Button onClick={ () => setIsBulkOperationsOpen(true) } variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Bulk Operations
          </Button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-6rem)]">
        {/* Main word list area */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Search Bar Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={onSearch}
              disabled={false}
            />
          </div>

          {/* Word List Display */}
          <div className="flex-1 min-h-0">
            {incompleteWords.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  {loadingWords && (
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Spinner
                        loading={loadingWords}
                        content="Loading words..."
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900">
                    Lexemes Needing Contributions
                  </h3>
                  {/* <p className="text-sm text-gray-500 mt-1">Only showing items that need audio or labels</p> */}
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {incompleteWords.map((word) => {
                      // If the word has a label from categoryLabel, show it as dim text and do not allow editing
                      const isApiLabel =
                        word.categoryLabel && word._fromApi === true;
                      const validation =
                        !isApiLabel && word.categoryLabel
                          ? validateLabel(word.categoryLabel)
                          : null;
                      return (
                        <div
                          key={`${word.lexeme_id}-${word.formId}`}
                          className="p-4 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-gray-800 font-medium">
                                  {word.lemma}
                                </span>
                                <div className="flex items-center gap-1">
                                  {!word.hasAudio && (
                                    <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs">
                                      <Mic className="w-3 h-3" />
                                      <span>Audio needed</span>
                                    </div>
                                  )}
                                  {!word.categoryLabel && (
                                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                                      <Tag className="w-3 h-3" />
                                      <span>Label needed</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Show label as dim text if from API, else allow editing */}
                              {word.categoryLabel &&
                                (isApiLabel ? (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-400 italic">
                                      {word.categoryLabel}
                                    </p>
                                  </div>
                                ) : (
                                  // ... existing editable label logic ...
                                  <div className="mt-2">
                                    <div className="flex items-start gap-2 group/label">
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-600">
                                          {word.categoryLabel}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWord(word.lexeme_id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No lexemes need work
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={incompleteWords.length === 0}
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Word generators sidebar */}
        <div className="space-y-4">
          {/* Wikimedia Category Section at Top */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm font-bold">
                W
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Wikimedia Category
                </h4>
                <p className="text-xs text-gray-500">
                  Words from Wikipedia categories
                </p>
              </div>
            </div>
            <Button
              onClick={onOpenWikimediaModal}
              variant="outline"
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Category
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Other Generators</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWordGenerators(!showWordGenerators)}
            >
              {showWordGenerators ? "Hide" : "Show"}
            </Button>
          </div>

          {showWordGenerators ? (
            <div className="space-y-3">
              <WordGeneratorButton
                icon="📝"
                label="Local List"
                description="Use your saved word lists"
                onClick={() => console.log("Local List clicked")}
              />
              <WordGeneratorButton
                icon="🎯"
                label="Nearby"
                description="Words from your location"
                onClick={() => console.log("Nearby clicked")}
              />
              <WordGeneratorButton
                icon="🔧"
                label="External Tools"
                description="Import from external sources"
                onClick={() => console.log("External Tools clicked")}
              />
              <WordGeneratorButton
                icon="📚"
                label="Wikidata Lexeme"
                description="Lexical data from Wikidata"
                onClick={() => console.log("Wikidata Lexeme clicked")}
                iconBg="bg-red-100"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                Click "Show" to see additional word sources
              </p>
            </div>
          )}

          {/* <Button
            variant="outline"
            onClick={handleShareList}
            disabled={incompleteWords.length === 0}
            className="w-full mt-6 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share List
          </Button> */}
        </div>
      </div>

      {/* Bulk Operations Modal */}
      {/* <BulkLabelOperations
        isOpen={isBulkOperationsOpen}
        onClose={() => setIsBulkOperationsOpen(false)}
        words={words}
        onWordsChange={onWordsChange}
      /> */}

      {/* Label Editing Modal */}
      {/* {isLabelModalOpen && modalEditingWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Label</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLabelModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Word
                </Label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {modalEditingWord.word}
                </p>
              </div>

              <div>
                <Label
                  htmlFor="modal-label-input"
                  className="text-sm font-medium text-gray-700"
                >
                  Definition or Description
                </Label>
                <textarea
                  id="modal-label-input"
                  value={editingLabelValue}
                  onChange={(e) => setEditingLabelValue(e.target.value)}
                  placeholder="Enter a detailed definition or description for this word"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />

                {editingLabelValue && (
                  <div className="mt-2 flex items-center gap-2">
                    {(() => {
                      const validation = validateLabel(editingLabelValue);
                      return (
                        <>
                          <Badge
                            className={getQualityBadgeColor(validation.score)}
                          >
                            Quality: {validation.score}%
                          </Badge>
                          {validation.errors.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {validation.errors.length} errors
                            </Badge>
                          )}
                          {validation.warnings.length > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs text-yellow-600"
                            >
                              {validation.warnings.length} warnings
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsLabelModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLabelModal}
                  disabled={!editingLabelValue.trim()}
                >
                  Save Label
                </Button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

interface WordGeneratorButtonProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
  iconBg?: string;
}

function WordGeneratorButton({
  icon,
  label,
  description,
  onClick,
  iconBg = "bg-blue-100",
}: WordGeneratorButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full h-auto p-4 justify-start hover:bg-gray-50 hover:border-gray-300"
    >
      <div className="flex items-start gap-3 w-full">
        <div
          className={cn(
            "w-8 h-8 rounded flex items-center justify-center text-sm font-bold flex-shrink-0",
            iconBg
          )}
        >
          {icon}
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
      </div>
    </Button>
  );
}
