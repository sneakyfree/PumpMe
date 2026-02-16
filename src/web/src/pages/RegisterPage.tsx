/**
 * Register Page
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthForms.css';

interface Props {
    onNavigate: (page: string) => void;
}

export default function RegisterPage({ onNavigate }: Props) {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(email, password, name || undefined);
        if (!result.success) {
            setError(result.error || 'Registration failed');
        } else {
            onNavigate('dashboard');
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Pump Me — $5 in free credits to start</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Name <span className="optional">(optional)</span></label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Free Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <button onClick={() => onNavigate('login')} className="link-btn">Sign in</button></p>
                </div>
            </div>
        </div>
    );
}
