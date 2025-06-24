"use client"

import { useEffect, useRef, useState } from "react"

interface WaveformVisualizerProps {
  isRecording: boolean
  audioStream?: MediaStream
  audioBlob?: Blob
  isPlaying?: boolean
  className?: string
}

export function WaveformVisualizer({
  isRecording,
  audioStream,
  audioBlob,
  isPlaying,
  className,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const audioContextRef = useRef<AudioContext>()
  const [waveformData, setWaveformData] = useState<number[]>([])

  useEffect(() => {
    if (isRecording && audioStream) {
      setupRecordingVisualization()
    } else if (isPlaying && audioBlob) {
      setupPlaybackVisualization()
    } else {
      cleanup()
    }

    return cleanup
  }, [isRecording, audioStream, audioBlob, isPlaying])

  const setupRecordingVisualization = async () => {
    if (!audioStream || !canvasRef.current) return

    try {
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(audioStream)
      analyserRef.current = audioContextRef.current.createAnalyser()

      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      drawWaveform()
    } catch (error) {
      console.error("Error setting up recording visualization:", error)
    }
  }

  const setupPlaybackVisualization = async () => {
    if (!audioBlob || !canvasRef.current) return

    try {
      audioContextRef.current = new AudioContext()
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

      // Create static waveform from audio buffer
      const channelData = audioBuffer.getChannelData(0)
      const samples = 100
      const blockSize = Math.floor(channelData.length / samples)
      const waveform = []

      for (let i = 0; i < samples; i++) {
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j])
        }
        waveform.push(sum / blockSize)
      }

      setWaveformData(waveform)
      drawStaticWaveform(waveform)
    } catch (error) {
      console.error("Error setting up playback visualization:", error)
    }
  }

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)

      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#1d4ed8")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
  }

  const drawStaticWaveform = (data: number[]) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const barWidth = canvas.width / data.length
    let x = 0

    data.forEach((value) => {
      const barHeight = value * canvas.height * 2

      const gradient = ctx.createLinearGradient(
        0,
        canvas.height / 2 - barHeight / 2,
        0,
        canvas.height / 2 + barHeight / 2,
      )
      gradient.addColorStop(0, "#10b981")
      gradient.addColorStop(1, "#059669")

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth - 1, barHeight)

      x += barWidth
    })
  }

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className={`border border-gray-200 rounded-lg bg-gray-50 ${className}`}
    />
  )
}
