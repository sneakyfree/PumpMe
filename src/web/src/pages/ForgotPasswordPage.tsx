/**
 * Forgot Password Page — request password reset email
 *
 * FEAT-028: Password reset flow frontend
 */

import { useState } from 'react';

interface Props {
    onNavigate: (page: string) => void;
}

export default function ForgotPasswordPage({ onNavigate }: Props) {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send reset email');
            }

            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>📧</span>
                    <h2 style={{ margin: '1rem 0 0.5rem' }}>Check Your Email</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
                        If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                        It expires in 1 hour.
                    </p>
                    <button className="btn btn-secondary" onClick={() => onNavigate('login')}>
                        ← Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Enter your email and we'll send you a reset link.
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fp-email">Email Address</label>
                        <input
                            id="fp-email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoFocus
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Sending...' : '📧 Send Reset Link'}
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
