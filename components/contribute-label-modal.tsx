"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddLabeledTranslationRequest, Language, LexemeSearchRequest, LexemeSearchResult } from "@/lib/types/api";
import { useEffect, useState } from "react";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { api } from "@/lib/api";

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language | null;
}

export default function ContributeLabelModal({
  open,
  onOpenChange,
  language,
}: ContributeModalProps) {
  const [query, setQuery] = useState("");
  const [lexemes, setLexemes] = useState<LexemeSearchResult[]>([]);
  const [hasSelectedLexeme, setHasSelectedLexeme] = useState(false);
  const { selectedLexeme, addLabeledTranslation } = useApiWithStore();

  const handleSubmit = async () => {
    const request: AddLabeledTranslationRequest = {
      lexeme_id: selectedLexeme?.lexeme?.id || "",
      sense_id: selectedLexeme?.glosses[0]?.senseId || "",
      translation_language: language?.lang_code || "",
      translation_value: query, // check
      is_new: hasSelectedLexeme, // check
      username: "JohnD12", // check
      categoryId: selectedLexeme?.lexeme?.lexicalCategoryId || "", // check
    }
    console.log("handleSubmit", request);
    const response = await addLabeledTranslation(request);
    console.log("response", response);
  };

  const getLexemes = async () => {
    const request: LexemeSearchRequest = {
      ismatch: 1,
      search: query,
      src_lang: language?.lang_code || "",
    };
    const results = await api.searchLexemes(request);
    setLexemes(results);
    setHasSelectedLexeme(false);
    console.log("lexemes zzzz", results);
  };

  useEffect(() => {
    getLexemes();
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Label Contribution</DialogTitle>
          <DialogDescription>
            Add a label to help improve our translations for{" "}
            {language ? language.lang_label : "the language"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for existing lexemes"
              className="w-full pl-10 pr-10 py-3 rounded-lg text-lg focus:outline-none transition-colors"
              style={{
                border: `1px solid #a2a9b1`,
                backgroundColor: "#ffffff",
                color: "#222222",
                cursor: "text",
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#0645ad")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#a2a9b1")}
            />
          </div>

          {lexemes.length > 0 && !hasSelectedLexeme && (
            <div 
              className="w-full bg-white rounded-lg shadow-lg overflow-auto"
              style={{ 
                border: `1px solid #a2a9b1`,
                maxHeight: "160px"
              }}
            >
              {lexemes.map((lexeme) => (
                <button
                  key={lexeme.id}
                  type="button"
                  onClick={() => {
                    setQuery(lexeme.label);
                    setHasSelectedLexeme(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm focus:outline-none flex items-center space-x-3 transition-colors"
                  style={{
                    color: "#222222",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div className="flex-1">
                    <div className="font-medium">{lexeme.label}</div>
                    <div className="text-xs" style={{ color: "#72777d" }}>
                      {lexeme.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {lexemes.length === 0 && query && (
            <div className="text-red-500 text-sm">
              Lexeme does not exist
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{hasSelectedLexeme ? "Save existing label" : "Save new label"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
