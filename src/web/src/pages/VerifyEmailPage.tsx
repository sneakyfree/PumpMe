/**
 * Verify Email Page — completes email verification via token
 *
 * FEAT-026: Email verification frontend
 * Reads ?token= from URL and calls POST /api/auth/verify-email
 */

import { useState, useEffect } from 'react';

interface Props {
    onNavigate: (page: string) => void;
}

export default function VerifyEmailPage({ onNavigate }: Props) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Missing verification token. Please use the link from your email.');
            return;
        }

        (async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error?.message || 'Verification failed');
                }

                setStatus('success');
                setMessage('Your email has been verified!');
            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : 'Verification failed');
            }
        })();
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <>
                        <span style={{ fontSize: '3rem' }}>⏳</span>
                        <h2 style={{ margin: '1rem 0 0.5rem' }}>Verifying Email...</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Please wait while we verify your email address.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <span style={{ fontSize: '3rem' }}>✅</span>
                        <h2 style={{ margin: '1rem 0 0.5rem' }}>Email Verified!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>{message}</p>
                        <button className="btn btn-primary" onClick={() => onNavigate('login')}>
                            Continue to Login →
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <span style={{ fontSize: '3rem' }}>❌</span>
                        <h2 style={{ margin: '1rem 0 0.5rem' }}>Verification Failed</h2>
                        <p style={{ color: 'rgba(255,100,100,0.7)', marginBottom: '1.5rem' }}>{message}</p>
                        <button className="btn btn-secondary" onClick={() => onNavigate('login')}>
                            ← Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
