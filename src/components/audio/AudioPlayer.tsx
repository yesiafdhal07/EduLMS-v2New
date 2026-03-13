'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    className?: string;
    showProgress?: boolean;
}

/**
 * Audio Player for Voice Note Feedback
 * Compact player for listening to teacher feedback
 */
export function AudioPlayer({ src, className = '', showProgress = true }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        const handleError = () => {
            setError(true);
            setIsLoading(false);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !showProgress) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        audioRef.current.currentTime = percentage * duration;
    };

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className={`flex items-center gap-2 text-rose-400 text-sm p-3 bg-rose-500/10 rounded-xl ${className}`}>
                <VolumeX size={18} />
                <span>Audio tidak tersedia</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 bg-violet-500/10 rounded-xl p-3 ${className}`}>
            <audio ref={audioRef} src={src} preload="metadata" />
            
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                disabled={isLoading}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isLoading 
                        ? 'bg-slate-700 cursor-wait' 
                        : 'bg-violet-500 hover:bg-violet-600'
                    }
                `}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                    <Pause size={18} className="text-white" />
                ) : (
                    <Play size={18} className="text-white ml-0.5" />
                )}
            </button>

            {/* Progress & Time */}
            {showProgress && (
                <div className="flex-1 min-w-0">
                    <div 
                        className="h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
                        onClick={handleProgressClick}
                    >
                        <div 
                            className="h-full bg-violet-500 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                            {formatTime(currentTime)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>
            )}

            {/* Mute Button */}
            <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
                {isMuted ? (
                    <VolumeX size={16} className="text-slate-400" />
                ) : (
                    <Volume2 size={16} className="text-violet-400" />
                )}
            </button>
        </div>
    );
}

export default AudioPlayer;
