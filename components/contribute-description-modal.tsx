"use client";

/**
 * Modal component for users to contribute descriptions to improve language translations.
 * Allows adding descriptions to selected lexemes with validation and loading states.
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddDescriptionRequest, Language, LexemeSearchRequest, LexemeSearchResult } from "@/lib/types/api";
import { useEffect, useState } from "react";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { api } from "@/lib/api";
import Spinner from "./spinner";

/**
 * Props for the ContributeDescriptionModal component.
 * @property {boolean} open - Controls the modal visibility state.
 * @property {(open: boolean) => void} onOpenChange - Callback to toggle modal open state.
 * @property {Language | null} language - Current language context for the description.
 * @property {() => void} [onSuccess] - Optional callback executed after successful submission.
 */
interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language | null;
  onSuccess?: () => void;
}

/**
 * Modal for contributing descriptions to lexemes.
 * Features a text input for descriptions, submit/cancel buttons, and loading states.
 * Submits descriptions via the `useApiWithStore` hook to the selected lexeme.
 */
export default function ContributeDescriptionModal({
  open,
  onOpenChange,
  language,
  onSuccess,
}: ContributeModalProps) {
  /** Current description text input value. */
  const [query, setQuery] = useState("");
  /** Submission loading state to prevent multiple submissions. */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** API hook providing selected lexeme context and description submission. */
  const { selectedLexeme, addDescription } = useApiWithStore();

  /**
   * Handles form submission to add a description to the selected lexeme.
   * Validates required data, constructs the API request, and handles success/error states.
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const request: AddDescriptionRequest[] = [{
        lexeme_id: selectedLexeme?.lexeme?.id || "",
        sense_id: selectedLexeme?.glosses[0]?.senseId || "",
        language: language?.lang_code || "",
        value: query,
      }];
      await addDescription(request);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting label:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add description</DialogTitle>
          <DialogDescription>
            Add a description to help improve our translations for{" "}
            {language ? language.lang_label : "the language"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Provide a description"
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

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Description"}
              <Spinner loading={isSubmitting} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
