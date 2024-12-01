import { useState, useRef } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { Button } from "@renderer/components/ui/button"
import { Card } from "@renderer/components/ui/card"
import { cn } from "@renderer/lib/utils"

interface VideoUploadProps {
  width?: number | string
  height?: number | string
  className?: string,
  onUpload?: (file: File) => void
  onClear?: () => void
}

export default function VideoUpload({
  width = '100%',
  height = '100%',
  className,
  onUpload,
  onClear
}: VideoUploadProps) {
  const [video, setVideo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideo(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onUpload?.(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideo(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onUpload?.(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const clearVideo = () => {
    setVideo(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      onClear?.()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const refreshVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const handleAreaClick = () => {
    if (!video) {
      fileInputRef.current?.click()
    }
  }

  // 处理尺寸值
  const parseSize = (size: string | number) => {
    if (typeof size === 'number') return `${size}px`
    if (typeof size === 'string') {
      // 如果已经包含单位（px、%、vh等），直接返回
      if (/^[0-9]+(\.[0-9]+)?(px|%|vh|vw|rem|em)$/.test(size)) return size
      // 如果只是数字字符串，添加px
      if (/^[0-9]+$/.test(size)) return `${size}px`
    }
    return size
  }

  const containerStyle = {
    width: parseSize(width),
    height: parseSize(height),
  }

  return (
    // <Card 
    //   className={cn(
    //     "w-full h-full", 
    //     className
    //   )}
    //   style={containerStyle}
    // >
    <div className="p-4 w-full h-full" style={containerStyle}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      <div
        className={`relative rounded-lg w-full h-full min-h-[200px] ${video ? 'border-solid' : 'border-dashed'}`}
        style={{
          borderWidth: "1px",
          borderColor: video ? "#e0e0e0" : "#b0b0b0",
          transition: "all 0.2s",
          padding: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#e0e0e0"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = video ? "#e0e0e0" : "#b0b0b0"
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleAreaClick}
      >
        {!video ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">将视频拖放到此处</p>
              <p className="text-sm text-gray-500">点击上传</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              src={previewUrl || undefined}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-black/30 text-white hover:bg-black/40 hover:text-white transition-all rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  refreshVideo()
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-black/30 text-white hover:bg-black/40 hover:text-white transition-all rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  clearVideo()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    // </Card>
  )
}

