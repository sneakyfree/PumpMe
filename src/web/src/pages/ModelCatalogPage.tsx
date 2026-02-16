import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Model { id: string; name: string; provider: string; params: string; category: string; license: string; context: string; speed: string; popular: boolean; }

const MODELS: Model[] = [
    { id: 'llama-3.1-405b', name: 'Llama 3.1 405B Instruct', provider: 'Meta', params: '405B', category: 'Chat', license: 'Llama 3.1', context: '128K', speed: '~25 tok/s', popular: true },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B Instruct', provider: 'Meta', params: '70B', category: 'Chat', license: 'Llama 3.1', context: '128K', speed: '~85 tok/s', popular: true },
    { id: 'llama-3.1-8b', name: 'Llama 3.1 8B Instruct', provider: 'Meta', params: '8B', category: 'Chat', license: 'Llama 3.1', context: '128K', speed: '~195 tok/s', popular: true },
    { id: 'mistral-7b', name: 'Mistral 7B Instruct v0.3', provider: 'Mistral AI', params: '7B', category: 'Chat', license: 'Apache 2.0', context: '32K', speed: '~195 tok/s', popular: true },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B Instruct', provider: 'Mistral AI', params: '47B MoE', category: 'Chat', license: 'Apache 2.0', context: '32K', speed: '~95 tok/s', popular: false },
    { id: 'codellama-34b', name: 'CodeLlama 34B Instruct', provider: 'Meta', params: '34B', category: 'Code', license: 'Llama 2', context: '16K', speed: '~110 tok/s', popular: true },
    { id: 'codellama-7b', name: 'CodeLlama 7B Instruct', provider: 'Meta', params: '7B', category: 'Code', license: 'Llama 2', context: '16K', speed: '~200 tok/s', popular: false },
    { id: 'deepseek-coder', name: 'DeepSeek Coder 33B', provider: 'DeepSeek', params: '33B', category: 'Code', license: 'Open', context: '16K', speed: '~100 tok/s', popular: false },
    { id: 'sdxl', name: 'Stable Diffusion XL', provider: 'Stability AI', params: '3.5B', category: 'Image', license: 'Open', context: 'N/A', speed: '~3s/img', popular: true },
    { id: 'whisper-large', name: 'Whisper Large v3', provider: 'OpenAI', params: '1.5B', category: 'Audio', license: 'MIT', context: '30min', speed: '~30x realtime', popular: false },
    { id: 'llama-guard', name: 'Llama Guard 3 8B', provider: 'Meta', params: '8B', category: 'Safety', license: 'Llama 3.1', context: '128K', speed: '~180 tok/s', popular: false },
    { id: 'e5-mistral', name: 'E5-Mistral-7B Embedding', provider: 'Intfloat', params: '7B', category: 'Embedding', license: 'MIT', context: '4K', speed: '~2000 tok/s', popular: false },
];

const categories = ['All', 'Chat', 'Code', 'Image', 'Audio', 'Safety', 'Embedding'];

export default function ModelCatalogPage({ onNavigate }: Props) {
    const [cat, setCat] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = MODELS.filter(m => (cat === 'All' || m.category === cat) && (m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase())));

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('models')}>← Models</button>
            <h1 style={{ margin: '1rem 0' }}>📋 Model Catalog</h1>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', flex: 1, minWidth: '150px' }} />
                {categories.map(c => (
                    <button key={c} onClick={() => setCat(c)} style={{ padding: '0.3rem 0.6rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, background: cat === c ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: cat === c ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>{c}</button>
                ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Model', 'Provider', 'Params', 'Context', 'Speed', 'License'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }} onClick={() => onNavigate('model-detail')}>
                                <td style={{ padding: '0.45rem 0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                                    {m.popular && <span style={{ marginLeft: '0.3rem', fontSize: '0.55rem', padding: '0.05rem 0.2rem', borderRadius: '3px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>⭐</span>}
                                </td>
                                <td style={{ padding: '0.45rem', color: '#00d4ff' }}>{m.provider}</td>
                                <td style={{ padding: '0.45rem' }}>{m.params}</td>
                                <td style={{ padding: '0.45rem', color: 'rgba(255,255,255,0.4)' }}>{m.context}</td>
                                <td style={{ padding: '0.45rem', color: '#34d399' }}>{m.speed}</td>
                                <td style={{ padding: '0.45rem', color: 'rgba(255,255,255,0.3)' }}>{m.license}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.75rem', textAlign: 'center' }}>{filtered.length} models · Speeds measured on H100 80GB</div>
        </div>
    );
}
