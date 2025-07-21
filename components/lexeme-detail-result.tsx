"use client";

import { GlossWithSense, LexemeDetail } from "@/lib/types/api";
import { Button } from "@/components/ui/button";

interface LexemeDetailResultProps {
  title?: string;
  glossesWithSense?: GlossWithSense[];
  lexemeDetail?: LexemeDetail;
  onContribute?: () => void;
}

export default function LexemeDetailResultComponent({
  title,
  glossesWithSense,
  lexemeDetail,
  onContribute,
}: LexemeDetailResultProps) {
  return (
    <div className="space-y-4">
      {/* {title && (
        <h3 className="text-lg font-medium" style={{ color: "#222222" }}>
          {title}
        </h3>
      )} */}
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
        {/* <h5 className="text-md font-medium" style={{ color: "#222222" }}>
            Definitions:
          </h5> */}

        {(!glossesWithSense || !glossesWithSense.length) && (
          <div>
            <p className="">No data available</p>
          </div>
        )}

        {glossesWithSense &&
          glossesWithSense.map((glossWithSense, index) => (
            <div key={index} className="py-3 rounded-lg">
              <div className="">
                <div className="flex-1">
                  <p
                    className="font-medium mb-1"
                    style={{ color: "#222222", textTransform: "capitalize" }}
                  >
                    {glossWithSense.gloss.value}
                  </p>
                  <p className="text-xs" style={{ color: "#72777d" }}>
                    Form ID: {glossWithSense.gloss.formId} | Sense ID:{" "}
                    {glossWithSense.senseId}
                  </p>
                </div>
                <div className="">
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
                      onClick={onContribute}
                    >
                      Add audio
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
