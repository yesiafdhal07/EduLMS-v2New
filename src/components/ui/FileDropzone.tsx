'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileDropzoneProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // in MB
    label?: string;
    description?: string;
    disabled?: boolean;
    uploading?: boolean;
    uploadProgress?: number;
    error?: string;
    success?: boolean;
}

export function FileDropzone({
    onFileSelect,
    accept = '*',
    maxSize = 10,
    label = 'Upload File',
    description = 'Drag & drop file di sini, atau klik untuk memilih',
    disabled = false,
    uploading = false,
    uploadProgress = 0,
    error,
    success,
}: FileDropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !uploading) {
            setIsDragOver(true);
        }
    }, [disabled, uploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            return `File terlalu besar. Maksimal ${maxSize}MB`;
        }

        // Check file type if accept is specified
        if (accept !== '*') {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const fileType = file.type;
            const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
            
            const isValidType = acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    return fileExt === type.toLowerCase();
                }
                if (type.endsWith('/*')) {
                    return fileType.startsWith(type.replace('/*', '/'));
                }
                return fileType === type;
            });

            if (!isValidType) {
                return `Format file tidak didukung. Gunakan: ${accept}`;
            }
        }

        return null;
    }, [accept, maxSize]);

    const handleFile = useCallback((file: File) => {
        setLocalError(null);
        
        const validationError = validateFile(file);
        if (validationError) {
            setLocalError(validationError);
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    }, [validateFile, onFileSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled || uploading) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [disabled, uploading, handleFile]);

    const handleClick = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setLocalError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayError = error || localError;

    return (
        <div className="w-full">
            <label className="text-sm font-medium text-slate-300 block mb-2">{label}</label>
            
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                    ${isDragOver ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' : 'border-white/20 hover:border-white/40'}
                    ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    ${displayError ? 'border-red-500/50 bg-red-500/5' : ''}
                    ${success ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled || uploading}
                />

                {uploading ? (
                    <div className="space-y-3">
                        <Loader2 className="w-12 h-12 mx-auto text-indigo-400 animate-spin" />
                        <p className="text-sm text-slate-300">Mengupload... {uploadProgress}%</p>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : selectedFile && !displayError ? (
                    <div className="space-y-3">
                        {success ? (
                            <CheckCircle className="w-12 h-12 mx-auto text-emerald-400" />
                        ) : (
                            <File className="w-12 h-12 mx-auto text-indigo-400" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-white truncate max-w-xs mx-auto">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-400">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto"
                        >
                            <X size={14} /> Hapus
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayError ? (
                            <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
                        ) : (
                            <Upload className={`w-12 h-12 mx-auto ${isDragOver ? 'text-indigo-400' : 'text-slate-500'}`} />
                        )}
                        <div>
                            <p className={`text-sm ${displayError ? 'text-red-400' : 'text-slate-300'}`}>
                                {displayError || description}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Maks. {maxSize}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
