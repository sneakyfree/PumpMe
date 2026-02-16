/**
 * Pump Report — Shareable session summary page
 *
 * FEAT-125/126: Share Your Pump — public session report with social sharing
 */

import './SessionHistory.css';

interface Props {
    sessionId: string;
    onNavigate: (page: string) => void;
}

// Mock data — in production this would be fetched from GET /api/sessions/:id/report
const MOCK_REPORT = {
    model: 'Llama 3 70B',
    gpu: '8x H100 SXM',
    tier: 'Beast',
    duration: '47 minutes',
    totalCost: '$27.73',
    tokensGenerated: 142_847,
    avgGpuUtil: 89,
    avgVramUsed: '68.3 / 80 GB',
    peakTemp: '72°C',
    provider: 'Vast.ai',
    speedup: '23.1x vs GPT-4 API',
};

export default function PumpReport({ sessionId, onNavigate }: Props) {
    const report = MOCK_REPORT;

    const shareText = `Just pumped ${report.model} on ${report.gpu} for ${report.duration} — ${report.speedup} faster! 🚀 @PumpMeGPU`;
    const shareUrl = `https://pumpme.cloud/pump-report/${sessionId}`;

    return (
        <div className="session-history" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('history')}>← Back to History</button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '3rem' }}>🏆</span>
                <h1 style={{ margin: '0.5rem 0' }}>Pump Report</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Session {sessionId.slice(0, 8)}…</p>
            </div>

            <div className="session-card" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Model</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{report.model}</div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>GPU</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{report.gpu}</div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Duration</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{report.duration}</div>
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Total Cost</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#00d4ff' }}>{report.totalCost}</div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>{report.tokensGenerated.toLocaleString()}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Tokens</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{report.avgGpuUtil}%</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Avg GPU</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00d4ff' }}>{report.speedup}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>vs Cloud API</div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>VRAM: </span>{report.avgVramUsed}</div>
                    <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Temp: </span>{report.peakTemp}</div>
                    <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>Provider: </span>{report.provider}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#1DA1F2', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    🐦 Share on X
                </a>
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#0A66C2', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    💼 LinkedIn
                </a>
                <button
                    className="btn btn-sm"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1.25rem', borderRadius: '6px' }}
                >
                    📋 Copy Link
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={() => onNavigate('pump')}>🔥 Pump Again</button>
                <button className="btn btn-secondary" onClick={() => onNavigate('history')}>📋 View History</button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>
                Powered by Pump Me — pumpme.cloud
            </div>
        </div>
    );
}
