import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Preset { id: string; name: string; model: string; temperature: number; maxTokens: number; description: string; systemPrompt: string; }

const PRESETS: Preset[] = [
    { id: 'pr-1', name: 'Creative Writer', model: 'llama-3.1-70b', temperature: 0.9, maxTokens: 2048, description: 'High creativity for stories, poetry, and brainstorming', systemPrompt: 'You are a creative writing assistant. Be imaginative, use vivid language, and explore unexpected ideas.' },
    { id: 'pr-2', name: 'Code Assistant', model: 'codellama-34b', temperature: 0.1, maxTokens: 4096, description: 'Precise code generation and debugging', systemPrompt: 'You are an expert programmer. Write clean, efficient code with clear comments. Always handle edge cases.' },
    { id: 'pr-3', name: 'Data Analyst', model: 'llama-3.1-70b', temperature: 0.3, maxTokens: 1024, description: 'Structured data analysis and insights', systemPrompt: 'You are a data analyst. Provide structured analysis with key metrics, trends, and actionable insights.' },
    { id: 'pr-4', name: 'Factual Q&A', model: 'llama-3.1-405b', temperature: 0.0, maxTokens: 512, description: 'Accurate, concise factual answers', systemPrompt: 'You are a factual assistant. Provide accurate, concise answers. If uncertain, say so clearly.' },
    { id: 'pr-5', name: 'Translator', model: 'mistral-7b', temperature: 0.2, maxTokens: 1024, description: 'Natural multi-language translation', systemPrompt: 'You are a professional translator. Produce natural, idiomatic translations that preserve meaning and tone.' },
    { id: 'pr-6', name: 'Summarizer', model: 'mistral-7b', temperature: 0.3, maxTokens: 512, description: 'Concise summaries of long content', systemPrompt: 'You are a summarization expert. Extract key points and present them clearly and concisely.' },
];

const TEMP_COLORS = (t: number) => t < 0.3 ? '#00d4ff' : t < 0.7 ? '#f59e0b' : '#ef4444';

export default function PlaygroundPresetsPage({ onNavigate }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('playground')}>← Playground</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>⚙️ Playground Presets</h1>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ Custom Preset</button>
            </div>

            {PRESETS.map(p => (
                <div key={p.id} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', cursor: 'pointer' }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>{p.description}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.25rem', borderRadius: '3px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>{p.model}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: TEMP_COLORS(p.temperature) }}>T={p.temperature}</span>
                        </div>
                    </div>
                    {expanded === p.id && (
                        <div style={{ padding: '0 1rem 0.75rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>
                                <span>Max Tokens: {p.maxTokens}</span>
                                <span>Temperature: {p.temperature}</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.3rem' }}>System Prompt:</div>
                            <pre style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '0.7rem', color: '#e2e8f0', lineHeight: 1.4 }}>{p.systemPrompt}</pre>
                            <button className="btn btn-primary" onClick={() => onNavigate('playground')} style={{ fontSize: '0.7rem', marginTop: '0.4rem' }}>Load Preset →</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
