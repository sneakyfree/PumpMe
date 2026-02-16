import { useState, useEffect } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Preferences {
    theme: 'dark' | 'light' | 'system';
    defaultGpu: string;
    defaultProvider: string;
    autoTerminateMinutes: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    sessionNotifications: boolean;
    billingAlerts: boolean;
    weeklyDigest: boolean;
    timezone: string;
    currency: string;
}

const DEFAULT_PREFS: Preferences = {
    theme: 'dark', defaultGpu: 'RTX 4090', defaultProvider: 'Vast.ai',
    autoTerminateMinutes: 480, emailNotifications: true, pushNotifications: false,
    sessionNotifications: true, billingAlerts: true, weeklyDigest: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, currency: 'USD',
};

export default function PreferencesPage({ onNavigate }: Props) {
    const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('pumpme_prefs');
        if (stored) try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) }); } catch { /* */ }
    }, []);

    const save = () => {
        localStorage.setItem('pumpme_prefs', JSON.stringify(prefs));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
        setPrefs(p => ({ ...p, [key]: value }));
    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#00d4ff' }}>{title}</div>
            {children}
        </div>
    );

    const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' }}>
            <span style={{ fontSize: '0.8rem' }}>{label}</span>
            <button onClick={() => onChange(!value)} style={{
                width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative',
                background: value ? '#00d4ff' : 'rgba(255,255,255,0.1)',
            }}>
                <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px',
                    left: value ? '21px' : '3px', transition: 'left 0.2s',
                }} />
            </button>
        </div>
    );

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <h1 style={{ margin: '1rem 0' }}>⚙️ Preferences</h1>

            <Section title="🎨 Appearance">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['dark', 'light', 'system'] as const).map(t => (
                        <button key={t} onClick={() => update('theme', t)} style={{
                            padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.8rem',
                            background: prefs.theme === t ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                            color: prefs.theme === t ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                        }}>{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🖥️'} {t}</button>
                    ))}
                </div>
            </Section>

            <Section title="🖥️ GPU Defaults">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Default GPU</label>
                        <select value={prefs.defaultGpu} onChange={e => update('defaultGpu', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                            <option>RTX 4090</option><option>A100 80GB</option><option>A6000</option><option>H100 80GB</option><option>RTX 3090</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Default Provider</label>
                        <select value={prefs.defaultProvider} onChange={e => update('defaultProvider', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                            <option>Vast.ai</option><option>RunPod</option><option>Lambda Labs</option><option>Any</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Auto-terminate after (minutes)</label>
                    <input type="number" value={prefs.autoTerminateMinutes} onChange={e => update('autoTerminateMinutes', Number(e.target.value))} style={{ display: 'block', width: '100px', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }} />
                </div>
            </Section>

            <Section title="🔔 Notifications">
                <Toggle label="Email notifications" value={prefs.emailNotifications} onChange={v => update('emailNotifications', v)} />
                <Toggle label="Push notifications" value={prefs.pushNotifications} onChange={v => update('pushNotifications', v)} />
                <Toggle label="Session start/end alerts" value={prefs.sessionNotifications} onChange={v => update('sessionNotifications', v)} />
                <Toggle label="Billing & credit alerts" value={prefs.billingAlerts} onChange={v => update('billingAlerts', v)} />
                <Toggle label="Weekly usage digest" value={prefs.weeklyDigest} onChange={v => update('weeklyDigest', v)} />
            </Section>

            <Section title="🌍 Locale">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Timezone</label>
                        <input value={prefs.timezone} onChange={e => update('timezone', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Currency</label>
                        <select value={prefs.currency} onChange={e => update('currency', e.target.value)} style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                            <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>CAD</option>
                        </select>
                    </div>
                </div>
            </Section>

            <button className="btn btn-primary" onClick={save} style={{ width: '100%' }}>
                {saved ? '✅ Saved!' : '💾 Save Preferences'}
            </button>
        </div>
    );
}
