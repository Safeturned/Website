'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface StandardFileUploadProps {
    onFileSelect: (file: File) => void;
    onUpload: (file: File) => Promise<void>;
    isUploading?: boolean;
    uploadProgress?: number;
    useChunkedUpload?: boolean;
    maxFileSize?: number;
    acceptedFileTypes?: string[];
    className?: string;
    disabled?: boolean;
    uploadStatus?: string;
    isPreparing?: boolean;
}

const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const DEFAULT_ACCEPTED_TYPES = ['.dll'];

export default function StandardFileUpload({
    onFileSelect,
    onUpload,
    isUploading = false,
    uploadProgress = 0,
    useChunkedUpload = false,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
    className = '',
    disabled = false,
    uploadStatus,
    isPreparing = false,
}: StandardFileUploadProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback(
        (file: File): string | null => {
            if (file.size > maxFileSize) {
                return t('errors.fileTooLarge', 'File is too large. Maximum size is {{size}}.', {
                    size: formatFileSize(maxFileSize),
                });
            }

            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!acceptedFileTypes.includes(fileExtension)) {
                return t(
                    'errors.invalidFileType',
                    'Invalid file type. Accepted types are {{types}}.',
                    { types: acceptedFileTypes.join(', ') }
                );
            }

            return null;
        },
        [maxFileSize, acceptedFileTypes, t]
    );

    const handleFileSelect = useCallback(
        (file: File) => {
            setError(null);
            const validationError = validateFile(file);

            if (validationError) {
                setError(validationError);
                return;
            }

            setSelectedFile(file);
            onFileSelect(file);
        },
        [validateFile, onFileSelect]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect]
    );

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
                setIsDragOver(true);
            }
        },
        [disabled]
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
                setIsDragOver(false);
            }
        },
        [disabled]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            if (disabled) return;

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [disabled, handleFileSelect]
    );

    const handleClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    const handleUpload = useCallback(async () => {
        if (!selectedFile || isUploading) return;

        try {
            await onUpload(selectedFile);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
    }, [selectedFile, isUploading, onUpload]);

    const handleClearFile = useCallback(() => {
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    return (
        <div className={`w-full ${className}`}>
            <div
                className={`
                    relative border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-all duration-300
                    ${
                        isDragOver
                            ? 'border-purple-400 bg-purple-500/10'
                            : 'border-purple-500/50 hover:border-purple-400/70'
                    }
                    ${
                        disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-purple-500/5'
                    }
                    ${error ? 'border-red-400 bg-red-500/10' : ''}
                `}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type='file'
                    accept={acceptedFileTypes.join(',')}
                    onChange={handleFileInputChange}
                    className='hidden'
                    disabled={disabled}
                />

                {!selectedFile ? (
                    <div className='space-y-4'>
                        <div className='mx-auto w-8 h-8 md:w-12 md:h-12 text-purple-400'>
                            <svg
                                className='w-full h-full'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                />
                            </svg>
                        </div>

                        <div>
                            <p className='text-base md:text-lg font-medium text-white mb-2'>
                                {t('upload.title', 'Choose file to upload')}
                            </p>
                            <p className='text-gray-400 text-xs md:text-sm mb-4'>
                                {t('upload.subtitle', 'or drag and drop here')}
                            </p>
                        </div>

                        <div className='text-xs text-gray-500'>
                            <p>
                                {t('upload.maxSize', 'Max file size: {{size}}', {
                                    size: formatFileSize(maxFileSize),
                                })}
                            </p>
                            <p>
                                {t('upload.acceptedTypes', 'Accepted types: {{types}}', {
                                    types: acceptedFileTypes.join(', '),
                                })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        <div className='mx-auto w-12 h-12 text-purple-400'>
                            <svg
                                className='w-full h-full'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                            </svg>
                        </div>

                        <div>
                            <p className='text-lg md:text-xl font-semibold text-white mb-2'>
                                {t('upload.fileSelected', 'File selected')}
                            </p>
                            <p
                                className='text-gray-400 truncate max-w-full text-sm md:text-base'
                                title={selectedFile.name}
                            >
                                {selectedFile.name}
                            </p>
                            <p className='text-xs md:text-sm text-gray-500 mt-1'>
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>

                        {isUploading ? (
                            <div className='space-y-2'>
                                <div className='w-full bg-gray-700 rounded-full h-2'>
                                    <div
                                        className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300'
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className='text-center'>
                                    <p className='text-sm text-gray-300'>
                                        {useChunkedUpload && uploadStatus
                                            ? uploadStatus
                                            : t('upload.uploading', 'Uploading...')}
                                    </p>
                                    {useChunkedUpload && (
                                        <p className='text-xs text-gray-400 mt-1'>
                                            {Math.round(uploadProgress)}% complete
                                        </p>
                                    )}
                                    {isPreparing && (
                                        <div className='flex items-center justify-center mt-2'>
                                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400'></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className='flex space-x-3 justify-center'>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleUpload();
                                    }}
                                    disabled={disabled}
                                    className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 disabled:hover:scale-100 text-sm md:text-base'
                                >
                                    {t('upload.upload', 'Upload')}
                                </button>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleClearFile();
                                    }}
                                    disabled={disabled}
                                    className='bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:hover:scale-100 text-sm md:text-base'
                                >
                                    {t('upload.cancel', 'Cancel')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className='mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                        <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
