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
import { generateAudioFilename } from "@/utils/label-validation";
import Spinner from "./spinner";

/**
 * Wikimedia Commons supported audio formats for optimal compatibility.
 */
const WIKIMEDIA_FORMATS: string[] = [
  'audio/ogg;codecs=opus',
  'audio/ogg;codecs=vorbis', 
  'audio/oga',
  'audio/flac',
  'audio/wav',
  'audio/opus',
  'audio/mpeg',
  'audio/mp3'
];

/**
 * Props interface for the ContributeAudioModal component.
 * 
 * @interface ContributeModalProps
 * @property {boolean} open - Controls the visibility state of the modal.
 * @property {(open: boolean) => void} onOpenChange - Callback triggered when modal open state changes.
 * @property {Language | null} language - Target language for the audio contribution.
 * @property {() => void} [onSuccess] - Optional callback triggered on successful submission.
 */
interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language | null;
  onSuccess?: () => void;
}

/**
 * A modal component for recording and submitting audio contributions to Wikimedia Commons.
 * 
 * Features:
 * - Real-time audio recording with waveform visualization
 * - Automatic format conversion to Wikimedia-compatible formats (WAV/OGG)
 * - Audio playback preview before submission
 * - Base64 encoding for API submission
 * - Recording duration timer
 * - Error handling and loading states
 * 
 * @component
 * @example
 * ```
 * <ContributeAudioModal
 *   open={isModalOpen}
 *   onOpenChange={setIsModalOpen}
 *   language={selectedLanguage}
 *   onSuccess={() => console.log('Audio submitted!')}
 * />
 * ```
 */
export default function ContributeAudioModal({
  open,
  onOpenChange,
  language,
  onSuccess,
}: ContributeModalProps) {
  /** State for recording status */
  const [isRecording, setIsRecording] = useState(false);
  
  /** State for recorded audio blob */
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  /** State for audio playback status */
  const [isPlaying, setIsPlaying] = useState(false);
  
  /** State for microphone audio stream */
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  /** State for recording duration in seconds */
  const [recordingTime, setRecordingTime] = useState(0);
  
  /** Reference for recording timer interval */
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  /** Reference for MediaRecorder instance */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  /** Reference for HTML audio element */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  /** Custom hook providing lexeme data and audio submission API */
  const { selectedLexeme, addAudioTranslation } = useApiWithStore();
  
  /** State for base64 encoded audio data for API submission */
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  /** State for submission loading indicator */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /** State for detected MIME type of recorded audio */
  const [mimeType, setMimeType] = useState<string | null>(null);
  
  /** State for audio conversion loading indicator */
  const [isConverting, setIsConverting] = useState(false);
  
  /** Reference for accumulating audio data chunks during recording */
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * Detects the best supported MIME type from Wikimedia Commons formats.
   * Falls back to webm/opus if no preferred format is supported.
   * 
   * @returns {string} The optimal MIME type supported by the browser.
   */
  const getSupportedMimeType = (): string => {
    for (const format of WIKIMEDIA_FORMATS) {
      if (MediaRecorder.isTypeSupported(format)) {
        return format;
      }
    }
    // Fallback to webm if none supported
    return 'audio/webm;codecs=opus';
  };

  /**
   * Converts recorded audio to WAV format using Web Audio API for Wikimedia Commons compatibility.
   * 
   * @param {Blob} blob - Original recorded audio blob.
   * @returns {Promise<Blob>} WAV formatted audio blob.
   */
  const convertAudioToOgg = async (blob: Blob): Promise<Blob> => {
    try {
      setIsConverting(true);
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      
      // Decode the audio
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create offline context for rendering
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      // Render the audio
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV format (more compatible than OGG)
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      return wavBlob;
    } catch (error) {
      console.error('Audio conversion failed:', error);
      // Return original blob if conversion fails
      return blob;
    } finally {
      setIsConverting(false);
    }
  };

  /**
   * Converts AudioBuffer to WAV Blob format.
   * Generates proper WAV file header with PCM encoding.
   * 
   * @param {AudioBuffer} buffer - Decoded audio buffer from Web Audio API.
   * @returns {Blob} WAV formatted audio blob.
   */
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  /**
   * Effect hook managing recording timer.
   * Updates recording duration every second while recording.
   * Cleans up timer on unmount or recording stop.
   */
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

  /**
   * Initiates audio recording using MediaRecorder API.
   * Requests microphone permissions and sets up optimal format detection.
   */
  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      // Get the best supported format for Wikimedia Commons
      const supportedMimeType = getSupportedMimeType();
      setMimeType(supportedMimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
      mediaRecorderRef.current = mediaRecorder;
      setRecordingTime(0);

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        // Create blob with the recorded format
        const originalBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        
        // Convert to WAV if not already in a Wikimedia Commons format
        let finalBlob = originalBlob;
        if (!supportedMimeType.includes('ogg') && !supportedMimeType.includes('oga') && !supportedMimeType.includes('wav')) {
          finalBlob = await convertAudioToOgg(originalBlob);
          setMimeType('audio/wav');
        }
        
        setAudioBlob(finalBlob);

        // Convert blob to base64
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.readAsDataURL(finalBlob);
        });
        setAudioBase64(base64Data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  /**
   * Stops the current recording session.
   * Releases microphone stream tracks and processes recorded audio.
   */
  const stopRecording = (): void => {
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

  /**
   * Initiates playback of the recorded audio.
   */
  const playRecording = (): void => {
    if (audioBlob) {
      setIsPlaying(true);
    }
  };

  /**
   * Resets the recording session to initial state.
   * Clears all audio data and UI states.
   */
  const resetRecording = (): void => {
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

  /**
   * Handles submission of recorded audio to Wikimedia Commons API.
   * Generates filename, converts to base64, and calls addAudioTranslation API.
   */
  const handleSubmit = async (): Promise<void> => {
    if (!audioBase64) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate filename using the utility function
      const lexemeId = selectedLexeme?.lexeme?.id || "";
      const destinationLanguageCode = language?.lang_code || "";
      const destinationLanguageLexemeLabel = selectedLexeme?.glosses.find((gl: any) => gl.gloss.language === destinationLanguageCode)?.gloss.value || "";
      
      // Determine file extension based on MIME type
      const getFileExtension = (mimeType: string): string => {
        if (mimeType.includes('wav')) return 'wav';
        if (mimeType.includes('ogg')) return 'ogg';
        if (mimeType.includes('oga')) return 'oga';
        if (mimeType.includes('flac')) return 'flac';
        if (mimeType.includes('opus')) return 'opus';
        if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'mp3';
        return 'wav'; // default fallback
      };
      
      const fileExtension = getFileExtension(mimeType || 'audio/wav');
      const filename = generateAudioFilename(
        lexemeId,
        destinationLanguageCode,
        destinationLanguageLexemeLabel, 
        fileExtension
      );

      const request: AddAudioTranslationRequest[] = [
        {
          file_content: audioBase64,
          filename: filename,
          formid: selectedLexeme?.glosses[0]?.gloss.formId || "",
          lang_label: language?.lang_label || "",
          lang_wdqid: language?.lang_wd_id || "",
        },
      ];

      await addAudioTranslation(request);
      onSuccess?.();
      onOpenChange(false); // Close the modal on success
    } catch (error) {
      console.error("Error submitting audio:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isConverting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!audioBlob || isSubmitting || isConverting}
            >
              <Spinner 
                loading={isSubmitting || isConverting} 
                content={
                  isConverting 
                    ? "Converting..." 
                    : isSubmitting 
                      ? "Uploading..." 
                      : "Submit"
                } 
              />
            </Button>
          </div>
          
          {isConverting && (
            <div className="text-center text-sm text-gray-600">
              Converting audio to Wikimedia Commons format...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
