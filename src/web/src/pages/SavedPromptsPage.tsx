import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface SavedPrompt { id: string; name: string; prompt: string; model: string; temp: number; tokens: number; lastUsed: string; uses: number; }

const MOCK_PROMPTS: SavedPrompt[] = [
    { id: '1', name: 'Code Review', prompt: 'Review this code for bugs, security issues, and performance. Suggest improvements:\n\n{{code}}', model: 'codellama/CodeLlama-34b', temp: 0.3, tokens: 1024, lastUsed: '2 hours ago', uses: 42 },
    { id: '2', name: 'Summarize Paper', prompt: 'Summarize this research paper in 3 paragraphs. Focus on methodology, results, and implications:\n\n{{paper}}', model: 'meta-llama/Llama-3.1-70B', temp: 0.5, tokens: 512, lastUsed: '1 day ago', uses: 18 },
    { id: '3', name: 'SQL Generator', prompt: 'Generate a PostgreSQL query for the following request. Use CTEs where appropriate:\n\n{{request}}\n\nSchema:\n{{schema}}', model: 'codellama/CodeLlama-34b', temp: 0.2, tokens: 256, lastUsed: '3 days ago', uses: 67 },
    { id: '4', name: 'Email Drafter', prompt: 'Write a professional email. Tone: {{tone}}. Subject: {{subject}}\n\nContext: {{context}}', model: 'mistralai/Mistral-7B', temp: 0.7, tokens: 512, lastUsed: '1 week ago', uses: 23 },
];

export default function SavedPromptsPage({ onNavigate }: Props) {
    const [prompts, setPrompts] = useState<SavedPrompt[]>(MOCK_PROMPTS);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const filtered = prompts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.prompt.toLowerCase().includes(search.toLowerCase()));

    const deletePrompt = (id: string) => setPrompts(prev => prev.filter(p => p.id !== id));

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('playground')}>← Playground</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <h1>💾 Saved Prompts</h1>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{prompts.length} prompts</span>
            </div>

            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prompts..." style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', marginBottom: '1rem' }} />

            {filtered.map(p => (
                <div key={p.id} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', cursor: 'pointer' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{p.model.split('/').pop()} · T={p.temp} · {p.tokens} tokens · {p.uses} uses</div>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>{expanded === p.id ? '▲' : '▼'}</span>
                    </div>
                    {expanded === p.id && (
                        <div style={{ padding: '0 1rem 0.75rem' }}>
                            <pre style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', lineHeight: 1.4, overflow: 'auto', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{p.prompt}</pre>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-primary" onClick={() => onNavigate('playground')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>▶ Use in Playground</button>
                                <button style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }} onClick={() => deletePrompt(p.id)}>🗑 Delete</button>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.35rem' }}>Last used {p.lastUsed}</div>
                        </div>
                    )}
                </div>
            ))}

            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>No prompts found</div>}
        </div>
    );
}
