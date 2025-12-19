"use client";

import {
  GlossWithSense,
  LexemeDetail,
  LexemeTranslation,
} from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useEffect, useState } from "react";
import { Tooltip } from "@/components/ui/tooltip-info";

/**
 * Props for the LexemeDetailResultComponent.
 * @interface LexemeDetailResultProps
 * @property {string} [title] - Optional title for the component.
 * @property {GlossWithSense[]} [glossesWithSense] - Array of glosses with sense data.
 * @property {LexemeDetail} [lexemeDetail] - Detailed information about the lexeme.
 * @property {LexemeTranslation | null} [translation] - Translation data for the lexeme.
 * @property {(type: "description" | "audio" | "translation") => void} [onContribute] - Optional callback for contribution actions.
 */
interface LexemeDetailResultProps {
  title?: string;
  glossesWithSense?: GlossWithSense[];
  lexemeDetail?: LexemeDetail;
  translation?: LexemeTranslation | null;
  onContribute?: (type: "description" | "audio" | "translation") => void;
}

/**
 * A React component that displays detailed information about a lexeme including images, 
 * lexical category, translations, descriptions/glosses, and audio pronunciation.
 * Handles authentication state and provides contribution buttons for missing data.
 * 
 * @component
 * @param {LexemeDetailResultProps} props - Component props.
 * @returns {JSX.Element} The rendered LexemeDetailResult component.
 * @example
 * ```
 * <LexemeDetailResultComponent
 *   lexemeDetail={lexemeData}
 *   glossesWithSense={glosses}
 *   translation={translationData}
 *   onContribute={handleContribute}
 * />
 * ```
 */
export default function LexemeDetailResultComponent({
  title,
  glossesWithSense,
  lexemeDetail,
  translation,
  onContribute,
}: LexemeDetailResultProps) {
  /** 
   * State to control menu visibility (currently unused in render).
   * @type {boolean}
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  /** API utilities with store integration */
  const { login, logout } = useApiWithStore();

  /** Authentication token from auth store */
  const token = useAuthStore((state) => state.token);
  /** Hydration function from auth store */
  const hydrate = useAuthStore((state) => state.hydrate);

  /**
   * Initial hydration effect on component mount.
   * Ensures auth state is properly initialized.
   */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /**
   * Re-hydrates authentication state when token changes.
   * Ensures store stays in sync with token updates.
   */
  useEffect(() => {
    // Re-hydrate when token changes
    if (token) {
      hydrate();
    }
  }, [token, hydrate]);

  return (
    <div className="space-y-4">
      {lexemeDetail && lexemeDetail.id && (
        <>
          {/* Image */}
          <div className="mb-4">
            <img
              src={lexemeDetail.image || "/no-image.png"}
              alt="Lexeme"
              className="w-full h-80 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* Lexeme Info */}
          <div>
            {token && (
              <h4
                className="text-md font-medium mb-2"
                style={{ color: "#222222" }}
              >
                {lexemeDetail.id}
              </h4>
            )}
            <p className="text-sm" style={{ color: "#72777d" }}>
              Category:{" "}
              <a
                href={`https://www.wikidata.org/wiki/${lexemeDetail.lexicalCategoryId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium gap-1 mb-3 text-blue-600 hover:text-blue-800"
              >
                {lexemeDetail.lexicalCategoryLabel}
              </a>
            </p>
          </div>
        </>
      )}

      {/* Glosses */}
      <div className="space-y-3">
        {(!glossesWithSense || !glossesWithSense.length) && (
          <div>
            <p className="">No data available</p>
          </div>
        )}

        {/* Translation */}
        {translation && (
          <div className="pb-4 pt-4">
            <p className="text-sm border-b border-gray-200 mb-5 font-semibold">
              Translation
            </p>
            <div className="">
              <div className="flex">
                {token && (
                  <div className="flex-3 pr-8 border-r-[5px] border-gray-300 justify-center items-center flex mr-4">
                    <div className="space-y-1">
                      <p className="text-xs" style={{ color: "#72777d" }}>
                        {translation?.trans_sense_id || "Sense ID Missing..."}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="space-y-1">
                    {translation?.value ? (
                      <div
                        className="font-medium text-lg"
                        style={{
                          color: "#222222",
                          textTransform: "capitalize",
                        }}
                      >
                        {translation.value}
                        <p className="text-xs" style={{ color: "#72777d" }}>
                          {translation.trans_language}
                        </p>
                      </div>

                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          style={{
                            color: "#0645ad",
                            borderColor: "#0645ad",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f8ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                          onClick={() => onContribute?.("translation")}
                        >
                          Contribute translation
                        </Button>
                        <Tooltip description="Add a translation for this word in the target language to help others understand its meaning." />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm border-b border-gray-200 pt-4 mb-4 font-semibold">
            Descriptions
          </p>
          {glossesWithSense &&
            glossesWithSense.map((glossWithSense, index) => (
              <div key={index} className="py-3 rounded-lg">
                <div className="flex">
                  {/* Left side: Lexeme and Sense Info */}
                  {token && (
                    <div className="flex-3 pr-8 border-r-[5px] border-gray-300 justify-center items-center flex  mr-4">
                      <div className="space-y-1">
                        {lexemeDetail?.id && (
                          <a
                            href={`https://www.wikidata.org/wiki/Lexeme:${lexemeDetail.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium flex items-center gap-1 mb-3 text-blue-600 hover:text-blue-800"
                          >
                            {lexemeDetail.id}
                            <ExternalLink size={16} />
                          </a>
                        )}

                        <p className="text-xs" style={{ color: "#72777d" }}>
                          ({glossWithSense.gloss.formId})
                        </p>
                        <p className="text-xs" style={{ color: "#72777d" }}>
                          {glossWithSense.senseId}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Right side: Label and Language Code */}
                  <div className="flex-1 ">
                    <div className="space-y-1">
                      {glossWithSense.gloss.value ? (
                        <p
                          className="font-medium text-lg"
                          style={{
                            color: "#222222",
                            textTransform: "capitalize",
                          }}
                        >
                          {glossWithSense.gloss.value}
                        </p>

                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            style={{
                              color: "#0645ad",
                              borderColor: "#0645ad",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f0f8ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                            onClick={() => onContribute?.("description")}
                          >
                            Add Description
                          </Button>
                          <Tooltip description="Provide a description or definition for this word to help explain its meaning and usage." />
                        </div>
                      )}
                      <p className="text-sm" style={{ color: "#72777d" }}>
                        {glossWithSense.gloss.language}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audio section at bottom */}
                <p className="text-sm border-b border-gray-200 pt-4 mb-4 font-semibold mt-3">
                  Audios & Sounds
                </p>
                <div className="bordder-t border-gray-200">
                  {glossWithSense.gloss.audio ? (
                    <audio
                      controls
                      className="h-8"
                      style={{ minWidth: "120px" }}
                    >
                      <source
                        src={glossWithSense.gloss.audio}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio element.
                    </audio>

                  ) : (
                    <>
                      <p className="text-xs pb-1 italic">No audio found.</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          style={{
                            color: "#0645ad",
                            borderColor: "#0645ad",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f8ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                          onClick={() => onContribute?.("audio")}
                        >
                          Contribute audio translation
                        </Button>
                        <Tooltip description="Record or upload an audio file of this word being pronounced to help others learn the correct pronunciation." />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
