// Page loading skeleton

export default function PageSkeleton() {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '1rem', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '1.5rem', animation: 'shimmer 1.5s infinite 0.1s' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ height: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: `shimmer 1.5s infinite ${i * 0.15}s` }} />)}
            </div>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ height: '48px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '0.35rem', animation: `shimmer 1.5s infinite ${i * 0.1}s` }} />)}
            <style>{`@keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
    );
}
