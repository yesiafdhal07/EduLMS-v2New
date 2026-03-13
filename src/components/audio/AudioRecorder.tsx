'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AudioRecorderProps {
    onUploadComplete: (url: string) => void;
    maxDurationSeconds?: number;
    className?: string;
    storageFolder?: string;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading';

/**
 * Audio Recorder for Voice Note Feedback
 * Uses MediaRecorder API to record and upload to Supabase Storage
 */
export function AudioRecorder({ 
    onUploadComplete, 
    maxDurationSeconds = 120, // 2 minutes max
    className = '',
    storageFolder = 'audio-feedback'
}: AudioRecorderProps) {
    const [state, setState] = useState<RecordingState>('idle');
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                setState('recorded');
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // Collect data every second
            setState('recording');
            setDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDurationSeconds) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error('Recording failed:', err);
            setError('Tidak dapat mengakses mikrofon. Pastikan izin sudah diberikan.');
        }
    }, [maxDurationSeconds]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && state === 'recording') {
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [state]);

    const playPauseAudio = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const discardRecording = useCallback(() => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setDuration(0);
        setState('idle');
        setIsPlaying(false);
    }, [audioUrl]);

    const uploadRecording = useCallback(async () => {
        if (!audioUrl || audioChunksRef.current.length === 0) return;

        setState('uploading');
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const fileName = `${storageFolder}/${Date.now()}_feedback.webm`;

            const { data, error: uploadError } = await supabase.storage
                .from('edu-lms-voice-folder')
                .upload(fileName, audioBlob, {
                    contentType: 'audio/webm',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('edu-lms-voice-folder')
                .getPublicUrl(fileName);

            onUploadComplete(urlData.publicUrl);
            discardRecording();
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Gagal mengupload rekaman. Silakan coba lagi.');
            setState('recorded');
        }
    }, [audioUrl, storageFolder, supabase, onUploadComplete, discardRecording]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`bg-slate-800/50 rounded-2xl p-4 border border-white/10 ${className}`}>
            {/* Hidden audio element for playback */}
            {audioUrl && (
                <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)}
                />
            )}

            {/* Error Message */}
            {error && (
                <p className="text-rose-400 text-xs mb-3">{error}</p>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
                {state === 'idle' && (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all"
                    >
                        <Mic size={18} />
                        <span className="text-sm font-bold">Rekam Suara</span>
                    </button>
                )}

                {state === 'recording' && (
                    <>
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl animate-pulse"
                        >
                            <Square size={18} fill="currentColor" />
                            <span className="text-sm font-bold">Berhenti</span>
                        </button>
                        <span className="text-sm font-mono text-rose-400">
                            {formatDuration(duration)} / {formatDuration(maxDurationSeconds)}
                        </span>
                    </>
                )}

                {state === 'recorded' && (
                    <>
                        <button
                            onClick={playPauseAudio}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause size={18} className="text-white" />
                            ) : (
                                <Play size={18} className="text-white ml-0.5" />
                            )}
                        </button>
                        <span className="text-sm font-mono text-slate-400">
                            {formatDuration(duration)}
                        </span>
                        <div className="flex-1" />
                        <button
                            onClick={discardRecording}
                            className="p-2 bg-white/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
                            title="Hapus"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={uploadRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all"
                        >
                            <Upload size={18} />
                            <span className="text-sm font-bold">Kirim</span>
                        </button>
                    </>
                )}

                {state === 'uploading' && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Mengupload...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AudioRecorder;
