import React, { useRef, useEffect, useState, useCallback, useMemo } from "react"
import Hls from 'hls.js'

/** Lightweight custom video player for self-hosted MP4/HLS URLs */

// Global video manager for single-play functionality
class GlobalVideoManager {
    private static instance: GlobalVideoManager | null = null
    private activeVideos: Map<string, () => void>
    private currentlyPlaying: string | null

    private constructor() {
        this.activeVideos = new Map<string, () => void>()
        this.currentlyPlaying = null
    }

    public static getInstance(): GlobalVideoManager {
        if (!GlobalVideoManager.instance) {
            GlobalVideoManager.instance = new GlobalVideoManager()
        }
        return GlobalVideoManager.instance
    }

    public registerVideo(videoId: string, pauseCallback: () => void): string {
        this.activeVideos.set(videoId, pauseCallback)
        return videoId
    }

    public unregisterVideo(videoId: string): void {
        if (this.currentlyPlaying === videoId) {
            this.currentlyPlaying = null
        }
        this.activeVideos.delete(videoId)
    }

    public playVideo(videoId: string): void {
        this.activeVideos.forEach((pauseCallback, id) => {
            if (id !== videoId) {
                pauseCallback()
            }
        })
        this.currentlyPlaying = videoId
    }
}

export interface CustomHLSPlayerProps {
    src?: string
    hlsUrl?: string
    muted?: boolean
    autoplay?: boolean
    loop?: boolean
    aspectRatio?: number
    borderRadius?: string
    hideControls?: boolean
    alwaysShowControls?: boolean
    accentColor?: string
    className?: string
    fillParent?: boolean
}

export default function CustomHLSPlayer(props: CustomHLSPlayerProps) {
    const sourceUrl = props.src || props.hlsUrl || ""
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(0)
    const [volume, setVolume] = useState<number>(props.muted ? 0 : 1)
    const [showControls, setShowControls] = useState<boolean>(true)
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [computedHeight, setComputedHeight] = useState<number>(0)

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const controlsTimeoutRef = useRef<number | null>(null)
    const uniqueVideoId = useRef<string>(`hls_video_${Date.now()}_${Math.random()}`)

    // Register with global video manager
    useEffect(() => {
        const manager = GlobalVideoManager.getInstance()
        const pauseVideo = () => {
            if (videoRef.current) {
                videoRef.current.pause()
                setIsPlaying(false)
            }
        }
        
        manager.registerVideo(uniqueVideoId.current, pauseVideo)
        
        return () => {
            manager.unregisterVideo(uniqueVideoId.current)
        }
    }, [])

    // Handle play/pause
    const togglePlayPause = useCallback(() => {
        if (!videoRef.current) return
        
        if (isPlaying) {
            videoRef.current.pause()
            setIsPlaying(false)
        } else {
            // Notify global manager to pause other videos
            const manager = GlobalVideoManager.getInstance()
            manager.playVideo(uniqueVideoId.current)
            
            videoRef.current.play()
            setIsPlaying(true)
        }
    }, [isPlaying])

    // Handle time update
    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }, [])

    // Handle metadata loaded
    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
            setIsLoading(false)
        }
    }, [])

    // Handle seeking
    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return
        
        const rect = e.currentTarget.getBoundingClientRect()
        const clickPosition = (e.clientX - rect.left) / rect.width
        const newTime = clickPosition * duration
        
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }, [duration])

    // Handle volume change
    const handleVolumeChange = useCallback((newVolume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = newVolume
            videoRef.current.muted = newVolume === 0
            setVolume(newVolume)
        }
    }, [])

    // Handle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return
        
        if (!isFullscreen) {
            ;(containerRef.current as any).requestFullscreen?.()
        } else {
            document.exitFullscreen?.()
        }
    }, [isFullscreen])

    // Auto-hide controls
    const resetControlsTimeout = useCallback(() => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        
        setShowControls(true)
        
        if (isPlaying && !props.alwaysShowControls) {
            controlsTimeoutRef.current = window.setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }
    }, [isPlaying, props.alwaysShowControls])

    // Mouse movement handler
    const handleMouseMove = useCallback(() => {
        if (!props.hideControls) {
            resetControlsTimeout()
        }
    }, [resetControlsTimeout, props.hideControls])

    // Responsive sizing
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect
            const aspectRatio = props.aspectRatio || 16/9
            const newHeight = width / aspectRatio
            setComputedHeight(newHeight)
        })

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [props.aspectRatio])

    // Video and HLS setup
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        let hls: Hls | null = null

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleError = () => {
            setError("Video error: Unable to play stream")
            setIsLoading(false)
        }
        const handleLoadStart = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)

        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)
        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('error', handleError)
        video.addEventListener('loadstart', handleLoadStart)
        video.addEventListener('canplay', handleCanPlay)

        // If source is HLS and browser doesn't support it natively, use hls.js
        const isHls = sourceUrl.endsWith('.m3u8')
        if (isHls) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl
            } else if (Hls.isSupported()) {
                hls = new Hls({ enableWorker: true })
                hls.loadSource(sourceUrl)
                hls.attachMedia(video)
                hls.on(Hls.Events.ERROR, () => {
                    setError("Video error: Unable to play stream")
                    setIsLoading(false)
                })
                hls.on(Hls.Events.MANIFEST_PARSED, () => setIsLoading(false))
            } else {
                setError("HLS not supported in this browser")
                setIsLoading(false)
            }
        } else {
            // MP4 or other directly playable sources handled via src attr
            video.src = sourceUrl
        }

        return () => {
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('error', handleError)
            video.removeEventListener('loadstart', handleLoadStart)
            video.removeEventListener('canplay', handleCanPlay)
            if (hls) {
                hls.destroy()
            }
        }
    }, [handleTimeUpdate, handleLoadedMetadata, sourceUrl])

    // Fullscreen event listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // Format time helper
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Progress percentage
    const progressPercentage = useMemo(() => {
        return duration > 0 ? (currentTime / duration) * 100 : 0
    }, [currentTime, duration])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: props.fillParent ? "100%" : (computedHeight || "200px"),
                backgroundColor: "#000",
                borderRadius: props.borderRadius || "12px",
                overflow: "hidden",
                cursor: showControls ? "default" : "none",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={resetControlsTimeout}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
                // src assigned in effect (HLS.js or native)
                muted={props.muted}
                loop={props.loop}
                autoPlay={props.autoplay}
                playsInline
                onClick={togglePlayPause}
            />

            {/* Loading overlay */}
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "3px solid rgba(255,255,255,0.3)",
                            borderTop: "3px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                        }}
                    />
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        color: "white",
                        padding: "16px",
                        borderRadius: "8px",
                        textAlign: "center",
                        zIndex: 10,
                    }}
                >
                    <div style={{ fontSize: "16px", marginBottom: "8px" }}>⚠️</div>
                    <div style={{ fontSize: "12px" }}>{error}</div>
                </div>
            )}

            {/* Controls overlay */}
            {!props.hideControls && showControls && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        padding: "20px 16px 16px",
                        zIndex: 20,
                        transition: "opacity 0.3s ease",
                    }}
                >
                    {/* Progress bar */}
                    <div
                        style={{
                            width: "100%",
                            height: "4px",
                            backgroundColor: "rgba(255,255,255,0.3)",
                            borderRadius: "2px",
                            marginBottom: "12px",
                            cursor: "pointer",
                        }}
                        onClick={handleSeek}
                    >
                        <div
                            style={{
                                width: `${progressPercentage}%`,
                                height: "100%",
                                backgroundColor: props.accentColor || "#ff6b6b",
                                borderRadius: "2px",
                                transition: "width 0.1s ease",
                            }}
                        />
                    </div>

                    {/* Control buttons */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "white",
                        }}
                    >
                        {/* Left controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Play/Pause button */}
                            <button
                                onClick={togglePlayPause}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "white",
                                    cursor: "pointer",
                                    padding: "8px",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    {isPlaying ? (
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    ) : (
                                        <path d="M8 5v14l11-7z" />
                                    )}
                                </svg>
                            </button>

                            {/* Volume control */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        cursor: "pointer",
                                        padding: "4px",
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        {volume === 0 ? (
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        ) : (
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                        )}
                                    </svg>
                                </button>
                                
                                {/* Volume slider */}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    style={{
                                        width: "60px",
                                        height: "4px",
                                        background: `linear-gradient(to right, ${props.accentColor || "#ff6b6b"} 0%, ${props.accentColor || "#ff6b6b"} ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`,
                                        outline: "none",
                                        cursor: "pointer",
                                    }}
                                />
                            </div>

                            {/* Time display */}
                            <div style={{ fontSize: "14px", fontFamily: "monospace" }}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>

                        {/* Right controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Fullscreen button */}
                            <button
                                onClick={toggleFullscreen}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "white",
                                    cursor: "pointer",
                                    padding: "4px",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    {isFullscreen ? (
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                    ) : (
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for loading spinner animation */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    )
}

// Default props via function defaulting can be handled by callers