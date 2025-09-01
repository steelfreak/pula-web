"use client";

import {
  GlossWithSense,
  LexemeDetail,
  LexemeTranslation,
} from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import type { AuthState } from "@/lib/stores/authStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useEffect, useState } from "react";

interface LexemeDetailResultProps {
  title?: string;
  glossesWithSense?: GlossWithSense[];
  lexemeDetail?: LexemeDetail;
  translation?: LexemeTranslation | null;
  onContribute?: (type: "description" | "audio" | "translation") => void;
}

export default function LexemeDetailResultComponent({
  title,
  glossesWithSense,
  lexemeDetail,
  translation,
  onContribute,
}: LexemeDetailResultProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { login, logout } = useApiWithStore();
  const token = useAuthStore((state: AuthState) => state.token);
  const hydrate = useAuthStore((state: AuthState) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
            <h4
              className="text-md font-medium mb-2"
              style={{ color: "#222222" }}
            >
              {lexemeDetail.id}
            </h4>
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
            <p className="text-sm border-b border-gray-200 mb-5">
              Translation:
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm border-b border-gray-200 pt-4 mb-4">
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
                      )}
                      <p className="text-sm" style={{ color: "#72777d" }}>
                        {glossWithSense.gloss.language}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audio section at bottom */}
                <div className="mt-3 pt-3 bordder-t border-gray-200">
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
                      Add audio
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
