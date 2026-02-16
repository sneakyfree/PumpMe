/**
 * Settings Page — API key management, preferences, account settings
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import './AuthForms.css';

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    lastUsedAt: string | null;
    createdAt: string;
    expiresAt: string | null;
    isActive: boolean;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function SettingsPage({ onNavigate }: Props) {
    const { user } = useAuth();
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    async function loadKeys() {
        try {
            const res = await api.get<{ keys: ApiKey[] }>('/keys');
            if (res.success && res.data) setKeys(res.data.keys || []);
        } catch { /* ignore */ }
        setLoading(false);
    }

    async function createKey() {
        if (!newKeyName.trim()) return;
        setCreating(true);
        try {
            const res = await api.post<{ key: ApiKey & { rawKey: string } }>('/keys', { name: newKeyName });
            if (res.success && res.data) {
                setNewKey(res.data.key.rawKey);
                setNewKeyName('');
                loadKeys();
            }
        } catch { /* ignore */ }
        setCreating(false);
    }

    async function revokeKey(keyId: string) {
        try {
            await api.delete(`/keys/${keyId}`);
            loadKeys();
        } catch { /* ignore */ }
    }

    return (
        <div className="auth-container">
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>

            {/* API Keys */}
            <div className="auth-card" style={{ marginTop: '1rem' }}>
                <h2>API Keys</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Use API keys for programmatic access to PumpMe. Keys are shown only once at creation.
                </p>

                {/* New key created */}
                {newKey && (
                    <div style={{
                        background: 'rgba(52,199,89,0.1)',
                        border: '1px solid rgba(52,199,89,0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                    }}>
                        <p style={{ color: '#34c759', fontWeight: 600, marginBottom: '0.5rem' }}>
                            ✅ API key created — copy it now, it won't be shown again:
                        </p>
                        <code style={{
                            display: 'block',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            wordBreak: 'break-all',
                        }}>{newKey}</code>
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                            onClick={() => { navigator.clipboard.writeText(newKey); setNewKey(null); }}
                        >
                            Copy & Dismiss
                        </button>
                    </div>
                )}

                {/* Create new key */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Key name (e.g. Production)"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={createKey} disabled={creating || !newKeyName.trim()}>
                        {creating ? 'Creating...' : 'Create Key'}
                    </button>
                </div>

                {/* Key list */}
                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>
                ) : keys.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No API keys yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {keys.map(key => (
                            <div key={key.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{key.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                        {key.keyPrefix}... · Created {new Date(key.createdAt).toLocaleDateString()}
                                        {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <button
                                    onClick={() => revokeKey(key.id)}
                                    style={{
                                        background: 'rgba(255,59,48,0.1)',
                                        color: '#ff3b30',
                                        border: '1px solid rgba(255,59,48,0.2)',
                                        borderRadius: '6px',
                                        padding: '0.3rem 0.7rem',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Revoke
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Account Info */}
            <div className="auth-card" style={{ marginTop: '1.5rem' }}>
                <h2>Account Info</h2>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Plan:</strong> {user?.tier || 'Free'}</p>
                    <p><strong>Credits:</strong> ${((user?.creditBalance || 0) / 100).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => onNavigate('profile')}>Edit Profile</button>
                    <button className="btn btn-secondary" onClick={() => onNavigate('billing')}>Billing</button>
                </div>
            </div>
        </div>
    );
}
