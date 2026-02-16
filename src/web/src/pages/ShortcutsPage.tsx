// Shortcuts Page

interface Props { onNavigate: (page: string) => void; }

interface Shortcut { keys: string[]; desc: string; category: string; }

const SHORTCUTS: Shortcut[] = [
    // Navigation
    { keys: ['g', 'd'], desc: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['g', 'm'], desc: 'Go to Marketplace', category: 'Navigation' },
    { keys: ['g', 'p'], desc: 'Go to Pump (New Session)', category: 'Navigation' },
    { keys: ['g', 's'], desc: 'Go to Settings', category: 'Navigation' },
    { keys: ['g', 'h'], desc: 'Go to History', category: 'Navigation' },
    { keys: ['g', 'a'], desc: 'Go to API Keys', category: 'Navigation' },
    // Actions
    { keys: ['Ctrl', 'k'], desc: 'Quick Search', category: 'Actions' },
    { keys: ['Ctrl', 'n'], desc: 'New Session', category: 'Actions' },
    { keys: ['Ctrl', '/'], desc: 'Toggle Help', category: 'Actions' },
    { keys: ['Escape'], desc: 'Close Modal / Cancel', category: 'Actions' },
    // Session
    { keys: ['Ctrl', 'Enter'], desc: 'Start Session', category: 'Session' },
    { keys: ['Ctrl', 'Shift', 'X'], desc: 'Terminate Session', category: 'Session' },
    { keys: ['Ctrl', 'l'], desc: 'View Session Logs', category: 'Session' },
];

export default function ShortcutsPage({ onNavigate }: Props) {
    const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('settings')}>← Settings</button>
            <h1 style={{ margin: '1rem 0' }}>⌨️ Keyboard Shortcuts</h1>

            {categories.map(cat => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#00d4ff', marginBottom: '0.5rem' }}>{cat}</div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                        {SHORTCUTS.filter(s => s.category === cat).map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span style={{ fontSize: '0.85rem' }}>{s.desc}</span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {s.keys.map((k, j) => (
                                        <span key={j}>
                                            <kbd style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem', fontFamily: 'monospace' }}>{k}</kbd>
                                            {j < s.keys.length - 1 && <span style={{ margin: '0 0.15rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>+</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
