import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function ContactPage({ onNavigate }: Props) {
    const [form, setForm] = useState({ name: '', email: '', subject: '', category: 'general', message: '' });
    const [sent, setSent] = useState(false);

    const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    if (sent) return (
        <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <h2>Message Sent!</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>We'll get back to you within 24 hours. Check your email for a confirmation.</p>
            <button className="btn btn-primary" onClick={() => onNavigate('home')}>← Back to Home</button>
        </div>
    );

    return (
        <div style={{ maxWidth: '550px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('help')}>← Help Center</button>
            <h1 style={{ margin: '1rem 0' }}>📧 Contact Us</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Have a question, bug report, or feature request? We'd love to hear from you.
            </p>

            <form onSubmit={submit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Name</label>
                        <input required value={form.name} onChange={e => update('name', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', marginTop: '0.2rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Email</label>
                        <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', marginTop: '0.2rem' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Category</label>
                    <select value={form.category} onChange={e => update('category', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        <option value="general">General Inquiry</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="technical">Technical Support</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="enterprise">Enterprise Sales</option>
                        <option value="partnership">Partnership</option>
                    </select>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Subject</label>
                    <input required value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Brief description..." style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', marginTop: '0.2rem' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => update('message', e.target.value)} placeholder="Tell us more..." style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', resize: 'vertical', marginTop: '0.2rem' }} />
                </div>

                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>📨 Send Message</button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
                {[
                    { emoji: '⚡', label: 'Response', desc: '< 24h' },
                    { emoji: '💬', label: 'Live Chat', desc: 'Discord' },
                    { emoji: '📖', label: 'Docs', desc: 'API Ref' },
                ].map(c => (
                    <div key={c.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '1.2rem' }}>{c.emoji}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{c.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
