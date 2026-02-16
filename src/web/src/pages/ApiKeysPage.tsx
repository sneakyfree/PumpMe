/**
 * API Keys Management Page — create, view, revoke API keys
 *
 * FEAT-109: API Key Management UI
 */

import { useState, useEffect } from 'react';

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    lastUsed: string | null;
    createdAt: string;
    expiresAt: string | null;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function ApiKeysPage({ onNavigate }: Props) {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [revealedKey, setRevealedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => { loadKeys(); }, []);

    const loadKeys = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/keys', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setKeys(data.data?.keys || []);
            }
        } catch { /* silent */ }
        setLoading(false);
    };

    const createKey = async () => {
        if (!newKeyName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newKeyName }),
            });
            if (res.ok) {
                const data = await res.json();
                setRevealedKey(data.data?.key || null);
                setNewKeyName('');
                await loadKeys();
            }
        } catch { /* silent */ }
        setCreating(false);
    };

    const revokeKey = async (id: string) => {
        if (!confirm('Revoke this API key? This cannot be undone.')) return;
        try {
            await fetch(`/api/keys/${id}`, { method: 'DELETE', credentials: 'include' });
            await loadKeys();
        } catch { /* silent */ }
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <h1 style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🔑</span> API Keys
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Use API keys to access the OpenAI-compatible inference API at <code style={{ color: '#00d4ff' }}>/v1/chat/completions</code>
            </p>

            {/* Revealed key banner */}
            {revealedKey && (
                <div style={{
                    background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                    borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem',
                }}>
                    <div style={{ color: '#34d399', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        ⚠️ Copy your API key now — it won't be shown again
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <code style={{
                            flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
                            fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all',
                        }}>{revealedKey}</code>
                        <button onClick={() => copyKey(revealedKey)} style={{
                            padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
                            background: copied ? 'rgba(52,211,153,0.2)' : 'rgba(0,212,255,0.1)',
                            border: '1px solid rgba(0,212,255,0.2)', color: copied ? '#34d399' : '#00d4ff',
                            fontSize: '0.8rem',
                        }}>{copied ? '✓ Copied' : '📋 Copy'}</button>
                    </div>
                </div>
            )}

            {/* Create new key */}
            <div style={{
                display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '0.75rem',
            }}>
                <input
                    type="text"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="Key name (e.g., Production, Dev)"
                    onKeyDown={e => e.key === 'Enter' && createKey()}
                    style={{
                        flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.85rem',
                    }}
                />
                <button className="btn btn-primary" onClick={createKey} disabled={creating || !newKeyName.trim()} style={{ fontSize: '0.85rem' }}>
                    {creating ? '⏳...' : '+ Create Key'}
                </button>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            {!loading && keys.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
                    <p>No API keys yet. Create one to get started with programmatic access.</p>
                </div>
            )}

            {!loading && keys.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {keys.map(key => (
                        <div key={key.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                        }}>
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{key.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                    {key.prefix}••••••••
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', marginTop: '0.15rem' }}>
                                    Created {new Date(key.createdAt).toLocaleDateString()}
                                    {key.lastUsed && ` · Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                                </div>
                            </div>
                            <button onClick={() => revokeKey(key.id)} style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
                            }}>🗑 Revoke</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Usage example */}
            <div style={{
                marginTop: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)', padding: '1rem',
            }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>Quick Start</div>
                <pre style={{
                    background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px',
                    fontSize: '0.75rem', overflowX: 'auto', color: 'rgba(255,255,255,0.7)',
                }}>{`curl https://pumpme.io/v1/chat/completions \\
  -H "Authorization: Bearer pm_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"llama3-70b","messages":[{"role":"user","content":"Hello!"}]}'`}</pre>
            </div>
        </div>
    );
}
