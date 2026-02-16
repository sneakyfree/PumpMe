/**
 * User Profile Page — view/edit profile, change password
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import './AuthForms.css';

interface Props {
    onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: Props) {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwMessage, setPwMessage] = useState('');
    const [pwError, setPwError] = useState('');

    async function handleUpdateProfile(e: FormEvent) {
        e.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);

        try {
            const res = await api.patch<{ user: unknown }>('/auth/me', { name });
            if (res.success) {
                setMessage('Profile updated!');
                refreshUser();
            } else {
                setError('Failed to update profile');
            }
        } catch {
            setError('Network error');
        }
        setSaving(false);
    }

    async function handleChangePassword(e: FormEvent) {
        e.preventDefault();
        setPwError('');
        setPwMessage('');

        if (newPassword.length < 8) {
            setPwError('Password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('Passwords do not match');
            return;
        }

        setSaving(true);
        try {
            const res = await api.put('/auth/me/password', {
                currentPassword,
                newPassword,
            });
            if (res.success) {
                setPwMessage('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPwError('Failed to change password');
            }
        } catch {
            setPwError('Network error');
        }
        setSaving(false);
    }

    return (
        <div className="auth-container">
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>

            {/* Profile Form */}
            <div className="auth-card" style={{ marginTop: '1rem' }}>
                <h2>Your Profile</h2>
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} disabled className="input-disabled" />
                    </div>
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Plan</label>
                        <input type="text" value={user?.tier || 'free'} disabled className="input-disabled" />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    {message && <p className="form-success">{message}</p>}
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Password Change */}
            <div className="auth-card" style={{ marginTop: '1.5rem' }}>
                <h2>Change Password</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                    {pwError && <p className="form-error">{pwError}</p>}
                    {pwMessage && <p className="form-success">{pwMessage}</p>}
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Account Stats */}
            <div className="auth-card" style={{ marginTop: '1.5rem' }}>
                <h2>Account</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Credits</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00d4ff' }}>
                            ${((user?.creditBalance || 0) / 100).toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Plan</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            {user?.tier || 'Free'}
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={() => onNavigate('billing')}
                >
                    Manage Billing →
                </button>
            </div>
        </div>
    );
}
