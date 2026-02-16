/**
 * Reset Password Page — complete password reset with token
 *
 * FEAT-028: Password reset flow frontend
 * Reads ?token= from URL query (or passed via navigation state)
 */

import { useState, useEffect } from 'react';

interface Props {
    onNavigate: (page: string) => void;
}

export default function ResetPasswordPage({ onNavigate }: Props) {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Extract token from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token');
        if (t) setToken(t);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!token) {
            setError('Missing reset token. Please use the link from your email.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || 'Failed to reset password');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>✅</span>
                    <h2 style={{ margin: '1rem 0 0.5rem' }}>Password Reset!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
                        Your password has been updated. You can now sign in with your new password.
                    </p>
                    <button className="btn btn-primary" onClick={() => onNavigate('login')}>
                        Sign In →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Set New Password</h2>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Enter your new password below.
                </p>

                {error && <div className="error-msg">{error}</div>}

                {!token && (
                    <div style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
                        ⚠️ No reset token found. Please use the link from your email, or enter your token manually below.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!token && (
                        <div className="form-group">
                            <label htmlFor="rp-token">Reset Token</label>
                            <input
                                id="rp-token"
                                type="text"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder="Paste your reset token"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="rp-password">New Password</label>
                        <input
                            id="rp-password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rp-confirm">Confirm Password</label>
                        <input
                            id="rp-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your new password"
                            required
                            minLength={8}
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Resetting...' : '🔑 Reset Password'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button className="link-btn" onClick={() => onNavigate('login')} style={{ color: 'rgba(255,255,255,0.4)' }}>
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
