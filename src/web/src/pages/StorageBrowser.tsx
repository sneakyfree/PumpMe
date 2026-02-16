/**
 * Storage File Browser — browse, upload, download files in Pump Home
 *
 * FEAT-093: File browser UI for MinIO storage
 */

import { useState, useEffect, useCallback } from 'react';

interface StorageFile {
    key: string;
    size: number;
    lastModified: string;
}

interface StorageUsage {
    totalBytes: number;
    fileCount: number;
}

interface Props {
    onNavigate: (page: string) => void;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
        py: '🐍', ts: '📜', js: '📜', json: '📋', md: '📝', txt: '📄',
        png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️',
        mp4: '🎥', avi: '🎥', mov: '🎥', mkv: '🎥',
        mp3: '🎵', wav: '🎵', flac: '🎵',
        zip: '📦', tar: '📦', gz: '📦',
        safetensors: '🧠', gguf: '🧠', bin: '🧠',
        csv: '📊', parquet: '📊',
    };
    return icons[ext] || '📄';
}

export default function StorageBrowser({ onNavigate }: Props) {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [usage, setUsage] = useState<StorageUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [prefix, setPrefix] = useState('');
    const [error, setError] = useState('');

    const loadFiles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (prefix) params.set('prefix', prefix);

            const [filesRes, usageRes] = await Promise.all([
                fetch(`/api/storage/files?${params}`, { credentials: 'include' }),
                fetch('/api/storage/usage', { credentials: 'include' }),
            ]);

            if (filesRes.ok) {
                const data = await filesRes.json();
                setFiles(data.data?.files || []);
            }
            if (usageRes.ok) {
                const data = await usageRes.json();
                setUsage(data.data);
            }
        } catch {
            setError('Failed to load files');
        }
        setLoading(false);
    }, [prefix]);

    useEffect(() => { loadFiles(); }, [loadFiles]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (prefix) formData.append('prefix', prefix);

            const res = await fetch('/api/storage/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            await loadFiles();
        } catch {
            setError('Upload failed');
        }
        setUploading(false);
    };

    const handleDelete = async (key: string) => {
        if (!confirm(`Delete ${key}?`)) return;
        try {
            await fetch(`/api/storage/files/${encodeURIComponent(key)}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            await loadFiles();
        } catch {
            setError('Delete failed');
        }
    };

    const handleDownload = async (key: string) => {
        try {
            const res = await fetch(`/api/storage/download/${encodeURIComponent(key)}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Download failed');
            const data = await res.json();
            window.open(data.data?.url, '_blank');
        } catch {
            setError('Download failed');
        }
    };

    // Compute quota percentage (default 5GB for demo)
    const quotaBytes = 5 * 1024 * 1024 * 1024;
    const usagePercent = usage ? Math.min((usage.totalBytes / quotaBytes) * 100, 100) : 0;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span>🏠</span> Pump Home
                </h1>
                <label style={{
                    padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
                    border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: '0.85rem',
                }}>
                    {uploading ? '⏳ Uploading...' : '📤 Upload File'}
                    <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
            </div>

            {/* Usage bar */}
            {usage && (
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '1rem', marginBottom: '1rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                            {formatBytes(usage.totalBytes)} of {formatBytes(quotaBytes)} used · {usage.fileCount} files
                        </span>
                        <span style={{ color: usagePercent > 80 ? '#ef4444' : '#00d4ff', fontWeight: 600, fontSize: '0.85rem' }}>
                            {usagePercent.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{
                        width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px',
                    }}>
                        <div style={{
                            width: `${usagePercent}%`, height: '100%', borderRadius: '3px',
                            background: usagePercent > 80 ? '#ef4444' : 'linear-gradient(90deg, #00d4ff, #7c3aed)',
                            transition: 'width 0.5s',
                        }} />
                    </div>
                </div>
            )}

            {/* Path breadcrumbs */}
            {prefix && (
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <button className="link-btn" onClick={() => setPrefix('')} style={{ color: '#00d4ff' }}>Home</button>
                    {prefix.split('/').filter(Boolean).map((part, i, arr) => (
                        <span key={i} style={{ color: 'rgba(255,255,255,0.3)' }}>
                            / <button className="link-btn" onClick={() => setPrefix(arr.slice(0, i + 1).join('/') + '/')} style={{ color: i === arr.length - 1 ? '#fff' : '#00d4ff' }}>{part}</button>
                        </span>
                    ))}
                </div>
            )}

            {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading files...</div>}

            {!loading && files.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📂</div>
                    <p>No files yet. Upload your first file to get started.</p>
                </div>
            )}

            {!loading && files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {files.map(file => (
                        <div key={file.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                            transition: 'all 0.2s',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '1.25rem' }}>{getFileIcon(file.key)}</span>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {file.key.split('/').pop()}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                        {formatBytes(file.size)} · {new Date(file.lastModified).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleDownload(file.key)} style={{
                                    background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                                    color: '#00d4ff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
                                }}>⬇ Download</button>
                                <button onClick={() => handleDelete(file.key)} style={{
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
                                }}>🗑 Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
