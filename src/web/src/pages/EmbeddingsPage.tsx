import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function EmbeddingsPage({ onNavigate }: Props) {
    const [text, setText] = useState('The quick brown fox jumps over the lazy dog.');
    const [model, setModel] = useState('e5-mistral-7b');
    const [dimensions, setDimensions] = useState(1024);

    const models = [
        { id: 'e5-mistral-7b', name: 'E5-Mistral 7B', dims: [256, 512, 1024, 4096], speed: '~2000 tok/s', cost: '$0.02/1M tokens' },
        { id: 'bge-large', name: 'BGE-Large-EN v1.5', dims: [256, 512, 1024], speed: '~5000 tok/s', cost: '$0.01/1M tokens' },
        { id: 'gte-qwen', name: 'GTE-Qwen2 7B', dims: [512, 1024, 2048], speed: '~1800 tok/s', cost: '$0.02/1M tokens' },
    ];

    const selected = models.find(m => m.id === model);
    const mockVector = Array.from({ length: 8 }, () => (Math.random() * 2 - 1).toFixed(6));

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1 style={{ margin: '1rem 0' }}>🔢 Embeddings</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Generate vector embeddings for semantic search, RAG, clustering, and classification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Model</label>
                    <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Dimensions</label>
                    <select value={dimensions} onChange={e => setDimensions(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                        {(selected?.dims || [1024]).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Enter text to embed..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' }} />

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Generate Embedding →</button>

            {/* Preview output */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Preview Output</div>
                <pre style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '0.7rem', color: '#e2e8f0', overflow: 'auto' }}>
                    {`{
  "model": "${model}",
  "dimensions": ${dimensions},
  "tokens": ${text.split(/\s+/).length},
  "embedding": [${mockVector.join(', ')}, ...]
}`}
                </pre>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
                    <span>⚡ {selected?.speed}</span>
                    <span>💰 {selected?.cost}</span>
                    <span>📐 {dimensions} dimensions</span>
                </div>
            </div>
        </div>
    );
}
