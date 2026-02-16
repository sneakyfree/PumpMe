/**
 * Session Summary — post-session completion card
 *
 * FEAT-072: Show stats after session ends, link to Pump Report
 */

interface Props {
    session: {
        id: string;
        model: string;
        tier: string;
        gpuType: string;
        duration: number; // minutes
        totalCost: number; // cents
        tokensGenerated?: number;
    };
    onNavigate: (page: string) => void;
}

export default function SessionSummary({ session, onNavigate }: Props) {
    const costStr = `$${(session.totalCost / 100).toFixed(2)}`;
    const durationStr = session.duration >= 60
        ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
        : `${session.duration}m`;

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 style={{ marginBottom: '0.25rem' }}>Session Complete</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
                Your GPU has been released. Here's your summary.
            </p>

            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Model</div>
                        <div style={{ fontWeight: 600 }}>{session.model}</div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>GPU</div>
                        <div style={{ fontWeight: 600 }}>{session.gpuType}</div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Duration</div>
                        <div style={{ fontWeight: 600 }}>{durationStr}</div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Cost</div>
                        <div style={{ fontWeight: 600, color: '#00d4ff', fontSize: '1.1rem' }}>{costStr}</div>
                    </div>
                </div>

                {session.tokensGenerated && (
                    <>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '1rem 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>
                                {session.tokensGenerated.toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Tokens Generated</div>
                        </div>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => onNavigate('pump')}>
                    🔥 Pump Again
                </button>
                <button className="btn btn-secondary" onClick={() => onNavigate('pump-report')}>
                    📊 Share Report
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => onNavigate('history')}>
                    📋 History
                </button>
            </div>
        </div>
    );
}
