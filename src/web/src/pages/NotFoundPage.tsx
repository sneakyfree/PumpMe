// 404 Not Found Page

interface Props { onNavigate: (page: string) => void; }

export default function NotFoundPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '6rem', marginBottom: '1rem', opacity: 0.8 }}>🔍</div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>404</h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>Page Not Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                The page you're looking for doesn't exist or has been moved.
                Try using the sidebar navigation or search with <kbd style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.8rem' }}>Ctrl+K</kbd>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => onNavigate('home')}>Go Home</button>
                <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            </div>
        </div>
    );
}
