"use client";

import { useState } from "react";
import { LexemeDetailResult } from "@/lib/types/api";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LexemeDetailResultProps {
  data?: LexemeDetailResult;
  title?: string;
  placeholder?: boolean;
  lexeme?: {
    id: string;
    lexicalCategoryId: string;
    lexicalCategoryLabel: string;
    image: string;
  };
  glosses?: {
    gloss: {
      language: string;
      value: string;
      audio?: string;
      formId: string;
    };
    senseId: string;
  }[];
  placeholderType?: "source" | "target1" | "target2";
}

export default function LexemeDetailResultComponent({
  data,
  title,
  placeholder = false,
  placeholderType = "source",
  lexeme,
  glosses,
}: LexemeDetailResultProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  // If no data, lexeme, glosses and not placeholder mode, don't render anything
  // if (!data && !lexeme && !glosses && !placeholder) {
  //   return null;
  // }

  const handleAudioPlay = (audioUrl: string) => {
    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(audioUrl);
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setAudioElement(audio);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  };

  const handleStopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-medium" style={{ color: "#222222" }}>
          {title}
        </h3>
      )}

      <div className="space-y-4">
        {/* Image */}
        <div className="mb-4">
          {(data?.lexeme.image || lexeme?.image) && (
            <img
              src={(data?.lexeme.image || lexeme?.image) || "/no-image.png"}
              alt="Lexeme"
              className="w-full h-80 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          {/* {data?.lexeme.image ? ( */}
          {/* <img
              src={data?.lexeme.image ? data.lexeme.image : "/no-image.png"}
              alt="Lexeme"
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            /> */}
          {/* ) : (
            <div 
              className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <p className="text-gray-500">No image available</p>
            </div>
          )} */}
        </div>

        {/* Lexeme Info */}
        <div>
          <h4 className="text-md font-medium mb-2" style={{ color: "#222222" }}>
            {(data?.lexeme.id || lexeme?.id) || "L123456"}
          </h4>
          <p className="text-sm" style={{ color: "#72777d" }}>
            Category: {(data?.lexeme.lexicalCategoryLabel || lexeme?.lexicalCategoryLabel) || "noun"}
          </p>
        </div>

        {/* Glosses */}
        <div className="space-y-3">
          <h5 className="text-md font-medium" style={{ color: "#222222" }}>
            Definitions:
          </h5>
          {(data?.glosses || glosses) && ((data?.glosses?.length || 0) > 0 || (glosses?.length || 0) > 0) ? (
            (data?.glosses || glosses || []).map((glossWithSense, index) => (
              <div
                key={index}
                className="py-3 rounded-lg"
                // style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
              >
                <div className="">
                  <div className="flex-1">
                    <p
                      className="font-medium mb-1"
                      style={{ color: "#222222" }}
                    >
                      {glossWithSense.gloss.language}:{" "}
                      {glossWithSense.gloss.value}
                    </p>
                    <p className="text-xs" style={{ color: "#72777d" }}>
                      Form ID: {glossWithSense.gloss.formId} | Sense ID:{" "}
                      {glossWithSense.senseId}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
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
                      >
                        Add audio
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Placeholder glosses
            <>
              <div
                className="py-3 rounded-lg"
                // style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className="font-medium mb-1"
                      style={{ color: "#222222" }}
                    >
                      {placeholderType === "source" && "en: example definition"}
                      {placeholderType === "target1" &&
                        "es: definición de ejemplo"}
                      {placeholderType === "target2" &&
                        "fr: définition d'exemple"}
                    </p>
                    <p className="text-xs" style={{ color: "#72777d" }}>
                      Form ID: L123456-F1 | Sense ID: L123456-S1
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 flex-shrink-0 text-xs"
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
                  >
                    Add audio
                  </Button>
                </div>
              </div>
              <div
                className="py-3 rounded-lg"
                // style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className="font-medium mb-1"
                      style={{ color: "#222222" }}
                    >
                      {placeholderType === "source" &&
                        "es: definición de ejemplo"}
                      {placeholderType === "target1" &&
                        "en: example definition"}
                      {placeholderType === "target2" &&
                        "de: Beispieldefinition"}
                    </p>
                    <p className="text-xs" style={{ color: "#72777d" }}>
                      Form ID: L123456-F2 | Sense ID: L123456-S2
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 flex-shrink-0 text-xs"
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
                  >
                    Add audio
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
