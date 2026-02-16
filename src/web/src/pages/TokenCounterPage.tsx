import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

export default function TokenCounterPage({ onNavigate }: Props) {
    const [text, setText] = useState('');
    const [model, setModel] = useState('llama-3.1');

    // Approximate tokenization (GPT-style ~4 chars/token)
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const tokenEstimate = Math.ceil(charCount / 4);
    const lineCount = text ? text.split('\n').length : 0;

    // Cost estimates per model (per 1K tokens)
    const rates: Record<string, { input: number; output: number }> = {
        'llama-3.1': { input: 0.0008, output: 0.0008 },
        'mistral-7b': { input: 0.0003, output: 0.0003 },
        'codellama-34b': { input: 0.0005, output: 0.0005 },
        'llama-3.2-3b': { input: 0.0001, output: 0.0001 },
    };

    const rate = rates[model] || rates['llama-3.1'];
    const inputCost = (tokenEstimate / 1000) * rate.input;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('playground')}>← Playground</button>
            <h1 style={{ margin: '1rem 0' }}>🔢 Token Counter</h1>

            {/* Model selector */}
            <div style={{ marginBottom: '0.75rem' }}>
                <select value={model} onChange={e => setModel(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                    <option value="llama-3.1">Llama 3.1 70B</option>
                    <option value="mistral-7b">Mistral 7B</option>
                    <option value="codellama-34b">CodeLlama 34B</option>
                    <option value="llama-3.2-3b">Llama 3.2 3B</option>
                </select>
            </div>

            {/* Input */}
            <textarea rows={8} value={text} onChange={e => setText(e.target.value)} placeholder="Paste your text here to count tokens..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'monospace' }} />

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                {[
                    { label: 'Tokens (est.)', value: tokenEstimate.toLocaleString(), color: '#00d4ff' },
                    { label: 'Characters', value: charCount.toLocaleString(), color: '#7c3aed' },
                    { label: 'Words', value: wordCount.toLocaleString(), color: '#34d399' },
                    { label: 'Lines', value: lineCount.toLocaleString(), color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Cost estimate */}
            {tokenEstimate > 0 && (
                <div style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '10px', padding: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem' }}>Estimated input cost: </span>
                    <strong style={{ color: '#00d4ff', fontSize: '1rem' }}>${inputCost < 0.01 ? inputCost.toFixed(6) : inputCost.toFixed(4)}</strong>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.2rem' }}>
                        Based on {model.replace('-', ' ')} · ${rate.input}/1K input tokens
                    </div>
                </div>
            )}

            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.75rem', textAlign: 'center' }}>
                Token estimates are approximate (~4 chars/token). Actual tokenization varies by model.
            </div>
        </div>
    );
}
