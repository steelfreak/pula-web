"use client";

import { GlossWithSense, LexemeDetail } from "@/lib/types/api";
import { Button } from "@/components/ui/button";

interface LexemeDetailResultProps {
  title?: string;
  glossesWithSense?: GlossWithSense[];
  lexemeDetail?: LexemeDetail;
  onContribute?: (type: "label" | "audio") => void;
}

export default function LexemeDetailResultComponent({
  title,
  glossesWithSense,
  lexemeDetail,
  onContribute,
}: LexemeDetailResultProps) {
  console.log({ glossesWithSense, lexemeDetail });
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
              Category: {lexemeDetail.lexicalCategoryLabel}
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

        {glossesWithSense &&
          glossesWithSense.map((glossWithSense, index) => (
            <div key={index} className="py-3 rounded-lg">
              <div className="flex">
                {/* Left side: Lexeme and Sense Info */}
                <div className="flex-3 pr-8 border-r-[5px] border-gray-300 justify-center items-center flex">
                  <div className="space-y-1">
                    {lexemeDetail?.id && (
                      <a
                        href={`https://www.wikidata.org/wiki/Lexeme:${lexemeDetail.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline"
                        style={{ color: "#222222" }}
                      >
                        {lexemeDetail.id}
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

                {/* Right side: Label and Language Code */}
                <div className="flex-1 pl-4 ">
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
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() => onContribute?.("label")}
                      >
                        Add label
                      </Button>
                    )}
                    <p className="text-sm" style={{ color: "#72777d" }}>
                      {glossWithSense.gloss.language}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audio section at bottom */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                {glossWithSense.gloss.audio ? (
                  <audio controls className="h-8" style={{ minWidth: "120px" }}>
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
  );
}
