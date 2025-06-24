"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Mic, Volume2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { WaveformVisualizer } from "./waveform-visualizer"

interface HardwareCheckModalProps {
  isOpen: boolean
  onComplete: (success: boolean) => void
}

export function HardwareCheckModal({ isOpen, onComplete }: HardwareCheckModalProps) {
  const [step, setStep] = useState(0)
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isTestRecording, setIsTestRecording] = useState(false)
  const [testRecording, setTestRecording] = useState<Blob | null>(null)
  const [isPlayingTest, setIsPlayingTest] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const steps = [
    "Requesting microphone access",
    "Testing microphone input",
    "Recording test audio",
    "Playing back test audio",
    "Hardware check complete",
  ]

  useEffect(() => {
    if (isOpen) {
      startHardwareCheck()
    }
    return () => {
      cleanup()
    }
  }, [isOpen])

  const startHardwareCheck = async () => {
    setStep(0)
    setMicrophoneAccess(null)

    try {
      // Step 1: Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setAudioStream(stream)
      setMicrophoneAccess(true)
      setStep(1)

      // Step 2: Test microphone input
      await testMicrophoneInput(stream)
    } catch (error) {
      console.error("Microphone access denied:", error)
      setMicrophoneAccess(false)
    }
  }

  const testMicrophoneInput = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Monitor audio levels for 3 seconds
      const monitorLevels = () => {
        if (!analyserRef.current) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        setAudioLevel(average)

        if (step === 1) {
          requestAnimationFrame(monitorLevels)
        }
      }

      monitorLevels()

      // After 3 seconds, move to recording test
      setTimeout(() => {
        setStep(2)
      }, 3000)
    } catch (error) {
      console.error("Error testing microphone input:", error)
    }
  }

  const startTestRecording = () => {
    if (!audioStream) return

    setIsTestRecording(true)
    audioChunksRef.current = []

    const mediaRecorder = new MediaRecorder(audioStream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
      setTestRecording(audioBlob)
      setStep(3)
    }

    mediaRecorder.start()

    // Record for 3 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        setIsTestRecording(false)
      }
    }, 3000)
  }

  const playTestRecording = () => {
    if (!testRecording) return

    const audioUrl = URL.createObjectURL(testRecording)
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlayingTest(true)

      audioRef.current.onended = () => {
        setIsPlayingTest(false)
        setStep(4)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const completeCheck = (success: boolean) => {
    cleanup()
    onComplete(success)
  }

  const cleanup = () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < step) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (stepIndex === step) return <AlertCircle className="w-5 h-5 text-blue-500 animate-pulse" />
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] p-0" hideClose>
        <div className="p-6">
          <DialogTitle className="text-2xl font-semibold mb-6">Hardware Check</DialogTitle>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((stepName, index) => (
              <div key={index} className="flex items-center gap-3">
                {getStepIcon(index)}
                <span className={`${index <= step ? "text-gray-900" : "text-gray-500"}`}>{stepName}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === 0 && (
              <div className="text-center">
                <Mic className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Requesting access to your microphone...</p>
              </div>
            )}

            {step === 1 && microphoneAccess && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Mic className="w-6 h-6 text-green-500" />
                  <span className="text-green-600 font-medium">Microphone connected</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Speak into your microphone to test the input level</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    />
                  </div>
                  {audioStream && (
                    <WaveformVisualizer isRecording={true} audioStream={audioStream} className="mx-auto" />
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {isTestRecording ? (
                    <Mic className="w-6 h-6 text-red-500 animate-pulse" />
                  ) : (
                    <Mic className="w-6 h-6 text-blue-500" />
                  )}
                  <span className="font-medium">{isTestRecording ? "Recording..." : "Ready to record test audio"}</span>
                </div>
                <p className="text-sm text-gray-600">We'll record a 3-second test to verify your audio quality</p>
                {!isTestRecording && (
                  <Button onClick={startTestRecording} className="mt-4">
                    Start Test Recording
                  </Button>
                )}
                {isTestRecording && audioStream && (
                  <WaveformVisualizer isRecording={true} audioStream={audioStream} className="mx-auto" />
                )}
              </div>
            )}

            {step === 3 && testRecording && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="w-6 h-6 text-green-500" />
                  <span className="font-medium">Test recording complete</span>
                </div>
                <p className="text-sm text-gray-600">Click play to hear your test recording</p>
                <div className="space-y-4">
                  <WaveformVisualizer audioBlob={testRecording} isPlaying={isPlayingTest} className="mx-auto" />
                  <Button onClick={playTestRecording} disabled={isPlayingTest}>
                    {isPlayingTest ? "Playing..." : "Play Test Recording"}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="text-lg font-semibold text-green-600">Hardware Check Complete!</h3>
                <p className="text-gray-600">Your microphone and audio system are working properly.</p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button variant="outline" onClick={() => completeCheck(false)}>
                    Test Again
                  </Button>
                  <Button onClick={() => completeCheck(true)}>Continue to Recording</Button>
                </div>
              </div>
            )}

            {microphoneAccess === false && (
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 mx-auto text-red-500" />
                <h3 className="text-lg font-semibold text-red-600">Microphone Access Denied</h3>
                <p className="text-gray-600">Please allow microphone access in your browser settings and try again.</p>
                <Button onClick={startHardwareCheck}>Try Again</Button>
              </div>
            )}
          </div>
        </div>

        <audio ref={audioRef} style={{ display: "none" }} />
      </DialogContent>
    </Dialog>
  )
}
