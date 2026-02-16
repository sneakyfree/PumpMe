import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const LINKS = [
    { emoji: '💬', label: 'Discord Community', desc: '5,000+ GPU enthusiasts', url: 'https://discord.gg/pumpme', color: '#5865F2' },
    { emoji: '🐦', label: 'Twitter / X', desc: 'Latest updates & tips', url: 'https://twitter.com/pumpme_io', color: '#1DA1F2' },
    { emoji: '📺', label: 'YouTube Tutorials', desc: 'Step-by-step guides', url: 'https://youtube.com/@pumpme', color: '#FF0000' },
    { emoji: '📖', label: 'Blog', desc: 'Deep dives & announcements', url: 'https://blog.pumpme.io', color: '#00d4ff' },
    { emoji: '🐙', label: 'GitHub', desc: 'Open-source integrations', url: 'https://github.com/pumpme', color: '#fff' },
];

const SHOWCASES = [
    { title: 'Running Llama 3.1 70B for $1.10/hr', author: 'GpuNinja', likes: 234, tags: ['llama', 'a100'] },
    { title: 'Fine-tuning Mistral 7B with LoRA', author: 'AIBuilder', likes: 189, tags: ['fine-tuning', 'lora'] },
    { title: 'SDXL Batch Image Generation Pipeline', author: 'PixelForge', likes: 156, tags: ['sdxl', 'images'] },
    { title: 'Multi-GPU Training with DeepSpeed', author: 'ScaleMaster', likes: 142, tags: ['deepspeed', 'multi-gpu'] },
    { title: 'Running vLLM for High-Throughput Inference', author: 'FastServe', likes: 198, tags: ['vllm', 'inference'] },
];

const GUIDES = [
    { title: 'Getting Started with PumpMe', time: '5 min', level: 'Beginner' },
    { title: 'Choosing the Right GPU for Your Model', time: '8 min', level: 'Beginner' },
    { title: 'API Key Setup & OpenAI Compatibility', time: '3 min', level: 'Intermediate' },
    { title: 'Advanced: Multi-GPU Session Templates', time: '12 min', level: 'Advanced' },
];

export default function CommunityPage({ onNavigate }: Props) {
    const [tab, setTab] = useState<'links' | 'showcase' | 'guides'>('links');

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>
            <h1 style={{ margin: '1rem 0' }}>🌐 Community</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                {(['links', 'showcase', 'guides'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '0.4rem 0.75rem', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem',
                        background: tab === t ? 'rgba(0,212,255,0.1)' : 'transparent',
                        color: tab === t ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                        borderBottom: tab === t ? '2px solid #00d4ff' : '2px solid transparent',
                    }}>{t === 'links' ? '🔗 Links' : t === 'showcase' ? '🏆 Showcase' : '📚 Guides'}</button>
                ))}
            </div>

            {/* Links */}
            {tab === 'links' && (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {LINKS.map(l => (
                        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textDecoration: 'none', color: '#fff' }}>
                            <div style={{ fontSize: '1.5rem' }}>{l.emoji}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{l.desc}</div>
                            </div>
                            <span style={{ color: l.color, fontSize: '0.8rem' }}>→</span>
                        </a>
                    ))}
                </div>
            )}

            {/* Showcase */}
            {tab === 'showcase' && (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {SHOWCASES.map((s, i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>by @{s.author}</div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>❤️ {s.likes}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.35rem' }}>
                                {s.tags.map(t => <span key={t} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>#{t}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Guides */}
            {tab === 'guides' && (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {GUIDES.map((g, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'pointer' }}>
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#00d4ff' }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{g.time} · {g.level}</div>
                            </div>
                            <span style={{
                                fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px',
                                background: g.level === 'Beginner' ? 'rgba(52,211,153,0.1)' : g.level === 'Intermediate' ? 'rgba(0,212,255,0.1)' : 'rgba(168,85,247,0.1)',
                                color: g.level === 'Beginner' ? '#34d399' : g.level === 'Intermediate' ? '#00d4ff' : '#a855f7',
                            }}>{g.level}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
