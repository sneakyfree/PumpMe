// Benchmarks Page

interface Props { onNavigate: (page: string) => void; }

interface Benchmark { model: string; gpu: string; promptTps: number; genTps: number; ttft: number; p95Latency: number; maxBatch: number; }

const DATA: Benchmark[] = [
    { model: 'Llama 3.1 70B', gpu: 'H100 80GB', promptTps: 18500, genTps: 85, ttft: 120, p95Latency: 280, maxBatch: 32 },
    { model: 'Llama 3.1 70B', gpu: 'A100 80GB', promptTps: 9200, genTps: 42, ttft: 250, p95Latency: 580, maxBatch: 16 },
    { model: 'Llama 3.1 70B', gpu: 'A100 40GB', promptTps: 4800, genTps: 28, ttft: 480, p95Latency: 920, maxBatch: 4 },
    { model: 'Mistral 7B', gpu: 'H100 80GB', promptTps: 42000, genTps: 195, ttft: 45, p95Latency: 95, maxBatch: 128 },
    { model: 'Mistral 7B', gpu: 'A100 80GB', promptTps: 28000, genTps: 120, ttft: 85, p95Latency: 180, maxBatch: 64 },
    { model: 'Mistral 7B', gpu: 'RTX 4090', promptTps: 15000, genTps: 68, ttft: 110, p95Latency: 250, maxBatch: 16 },
    { model: 'CodeLlama 34B', gpu: 'H100 80GB', promptTps: 24000, genTps: 110, ttft: 80, p95Latency: 165, maxBatch: 64 },
    { model: 'CodeLlama 34B', gpu: 'A100 80GB', promptTps: 14000, genTps: 62, ttft: 160, p95Latency: 350, maxBatch: 32 },
    { model: 'SDXL', gpu: 'H100 80GB', promptTps: 0, genTps: 0, ttft: 0, p95Latency: 2800, maxBatch: 8 },
    { model: 'SDXL', gpu: 'A100 80GB', promptTps: 0, genTps: 0, ttft: 0, p95Latency: 4500, maxBatch: 4 },
];

export default function BenchmarksPage({ onNavigate }: Props) {
    const maxGenTps = Math.max(...DATA.filter(d => d.genTps > 0).map(d => d.genTps));

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>📈 Benchmarks</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Real-world inference performance across models and GPUs. Updated weekly.
            </p>

            {/* Gen speed bars */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>⚡ Generation Speed (tokens/sec)</div>
                {DATA.filter(d => d.genTps > 0).map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ width: '140px', fontSize: '0.75rem', flexShrink: 0 }}>{d.model}</span>
                        <span style={{ width: '80px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{d.gpu}</span>
                        <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: `${(d.genTps / maxGenTps) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', borderRadius: '3px' }} />
                            <span style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', fontWeight: 600 }}>{d.genTps}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Full table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>📊 Full Results</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Model', 'GPU', 'Prompt TPS', 'Gen TPS', 'TTFT (ms)', 'P95 (ms)', 'Max Batch'].map(h => (
                                <th key={h} style={{ textAlign: h === 'Model' || h === 'GPU' ? 'left' : 'right', padding: '0.4rem', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DATA.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.35rem 0.4rem', fontWeight: 600 }}>{d.model}</td>
                                <td style={{ padding: '0.35rem 0.4rem', color: '#00d4ff' }}>{d.gpu}</td>
                                <td style={{ textAlign: 'right', padding: '0.35rem' }}>{d.promptTps > 0 ? d.promptTps.toLocaleString() : '—'}</td>
                                <td style={{ textAlign: 'right', padding: '0.35rem' }}>{d.genTps > 0 ? d.genTps : '—'}</td>
                                <td style={{ textAlign: 'right', padding: '0.35rem' }}>{d.ttft > 0 ? d.ttft : '—'}</td>
                                <td style={{ textAlign: 'right', padding: '0.35rem' }}>{d.p95Latency.toLocaleString()}</td>
                                <td style={{ textAlign: 'right', padding: '0.35rem' }}>{d.maxBatch}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>
                    TPS = Tokens Per Second · TTFT = Time To First Token · P95 = 95th percentile latency · Measured with vLLM 0.3.3
                </div>
            </div>
        </div>
    );
}
