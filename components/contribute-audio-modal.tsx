"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, RotateCcw } from "lucide-react";
import { WaveformVisualizer } from "./contribution/waveform-visualizer";
import { AddAudioTranslationRequest, Language } from "@/lib/types/api";
import { useApiWithStore } from "@/hooks/useApiWithStore";

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language | null;
}

export default function ContributeAudioModal({
  open,
  onOpenChange,
  language,
}: ContributeModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { selectedLexeme, addAudioTranslation } = useApiWithStore();

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setRecordingTime(0);
      // timer will be started by useEffect when isRecording becomes true

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      setAudioStream(null);
      // timer will be stopped by useEffect when isRecording becomes false
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioStream(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      return;
    }

    const request: AddAudioTranslationRequest = {
      file_content: audioBlob,
      filename: "audio.ogg",
      formid: selectedLexeme?.glosses[0]?.gloss.formId || "",
      lang_label: language?.lang_label || "",
      lang_wdqid: language?.lang_wd_id || "",
    };
    console.log("Creating audio translation", request);
    const response = await addAudioTranslation(request);
    console.log("Audio translation created", response);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voice Contribution</DialogTitle>
          <DialogDescription>
            Record your voice to help improve our translations for{" "}
            {language ? language.lang_label : "the language"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                >
                  <Square className="h-8 w-8" />
                </Button>
                <WaveformVisualizer
                  isRecording={isRecording}
                  audioStream={audioStream!}
                  className="ml-4 w-48 h-16"
                />
                <span className="ml-4 text-lg font-mono tabular-nums">
                  {recordingTime}s
                </span>
              </>
            )}

            {audioBlob && !isRecording && !isPlaying && (
              <>
                <Button
                  onClick={playRecording}
                  size="lg"
                  className="h-16 w-16 rounded-full"
                >
                  <Play className="h-8 w-8" />
                </Button>
                <Button
                  onClick={resetRecording}
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full"
                >
                  <RotateCcw className="h-8 w-8" />
                </Button>
              </>
            )}

            {audioBlob && isPlaying && !isRecording && (
              <audio
                controls
                autoPlay
                src={URL.createObjectURL(audioBlob)}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!audioBlob}>
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
