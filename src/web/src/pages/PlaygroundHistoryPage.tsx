import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface HistoryItem { id: string; model: string; prompt: string; completion: string; tokens: number; cost: string; timestamp: string; }

const MOCK_HISTORY: HistoryItem[] = [
    { id: 'ph-1', model: 'llama-3.1-70b', prompt: 'Explain quantum computing in simple terms for a 10 year old', completion: 'Imagine you have a magical coin that can be heads AND tails at the same time...', tokens: 342, cost: '$0.0017', timestamp: '5 min ago' },
    { id: 'ph-2', model: 'codellama-34b', prompt: 'Write a Python function to merge two sorted arrays', completion: 'def merge_sorted(arr1, arr2):\n    result = []\n    i = j = 0\n    while i < len(arr1)...', tokens: 289, cost: '$0.0012', timestamp: '20 min ago' },
    { id: 'ph-3', model: 'mistral-7b', prompt: 'Translate to French: The weather is beautiful today', completion: 'Le temps est magnifique aujourd\'hui.', tokens: 45, cost: '$0.0001', timestamp: '1 hour ago' },
    { id: 'ph-4', model: 'llama-3.1-70b', prompt: 'Write a haiku about machine learning', completion: 'Data flows like streams\nPatterns emerge from the noise\nMachines learn to dream', tokens: 67, cost: '$0.0003', timestamp: '2 hours ago' },
    { id: 'ph-5', model: 'llama-3.1-405b', prompt: 'Compare REST vs GraphQL for a microservices architecture', completion: 'REST and GraphQL each have distinct advantages in microservices...', tokens: 890, cost: '$0.0089', timestamp: '1 day ago' },
];

export default function PlaygroundHistoryPage({ onNavigate }: Props) {
    const [search, setSearch] = useState('');
    const filtered = MOCK_HISTORY.filter(h => h.prompt.toLowerCase().includes(search.toLowerCase()) || h.model.includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('playground')}>← Playground</button>
            <h1 style={{ margin: '1rem 0' }}>🕐 Playground History</h1>

            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search history..." style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', marginBottom: '1rem', boxSizing: 'border-box' }} />

            {filtered.map(item => (
                <div key={item.id} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => onNavigate('playground')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontWeight: 600 }}>{item.model}</span>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{item.timestamp}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.2rem' }}>{item.completion}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                        <span>{item.tokens} tokens</span>
                        <span>{item.cost}</span>
                    </div>
                </div>
            ))}
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.75rem' }}>Click any entry to reload in Playground</div>
        </div>
    );
}
