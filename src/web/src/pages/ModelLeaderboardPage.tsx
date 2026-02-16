import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface ModelRank { rank: number; name: string; provider: string; elo: number; arena: number; coding: number; reasoning: number; change: number; }

const RANKINGS: ModelRank[] = [
    { rank: 1, name: 'Llama 3.1 405B', provider: 'Meta', elo: 1287, arena: 92.4, coding: 89.1, reasoning: 94.2, change: 0 },
    { rank: 2, name: 'GPT-4o', provider: 'OpenAI', elo: 1275, arena: 91.8, coding: 91.3, reasoning: 93.0, change: 0 },
    { rank: 3, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', elo: 1268, arena: 91.2, coding: 93.5, reasoning: 92.1, change: 1 },
    { rank: 4, name: 'Gemini 1.5 Pro', provider: 'Google', elo: 1254, arena: 90.1, coding: 88.7, reasoning: 91.8, change: -1 },
    { rank: 5, name: 'Llama 3.1 70B', provider: 'Meta', elo: 1231, arena: 88.5, coding: 85.2, reasoning: 89.4, change: 2 },
    { rank: 6, name: 'Mixtral 8x22B', provider: 'Mistral', elo: 1218, arena: 87.2, coding: 84.1, reasoning: 88.0, change: 0 },
    { rank: 7, name: 'Mistral Large', provider: 'Mistral', elo: 1205, arena: 86.0, coding: 83.5, reasoning: 87.2, change: -2 },
    { rank: 8, name: 'DeepSeek V2.5', provider: 'DeepSeek', elo: 1198, arena: 85.3, coding: 86.8, reasoning: 84.1, change: 3 },
    { rank: 9, name: 'Llama 3.1 8B', provider: 'Meta', elo: 1142, arena: 80.2, coding: 76.4, reasoning: 81.5, change: 0 },
    { rank: 10, name: 'Mistral 7B', provider: 'Mistral', elo: 1128, arena: 78.5, coding: 74.2, reasoning: 79.8, change: -1 },
];

export default function ModelLeaderboardPage({ onNavigate }: Props) {
    const [sort, setSort] = useState<'elo' | 'arena' | 'coding' | 'reasoning'>('elo');

    const sorted = [...RANKINGS].sort((a, b) => b[sort] - a[sort]);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('benchmarks')}>← Benchmarks</button>
            <h1 style={{ margin: '1rem 0' }}>🏆 Model Leaderboard</h1>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {(['elo', 'arena', 'coding', 'reasoning'] as const).map(s => (
                    <button key={s} onClick={() => setSort(s)} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', background: sort === s ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: sort === s ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>Sort: {s === 'elo' ? 'ELO' : s}</button>
                ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['#', 'Model', 'Provider', 'ELO', 'Arena %', 'Coding', 'Reasoning', 'Δ'].map(h => (
                                <th key={h} style={{ textAlign: h === '#' ? 'center' : 'left', padding: '0.45rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((m, i) => (
                            <tr key={m.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i < 3 ? 'rgba(245,158,11,0.02)' : 'transparent' }}>
                                <td style={{ textAlign: 'center', padding: '0.45rem', fontWeight: 700, color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                </td>
                                <td style={{ padding: '0.45rem', fontWeight: 600 }}>{m.name}</td>
                                <td style={{ padding: '0.45rem', color: '#00d4ff' }}>{m.provider}</td>
                                <td style={{ padding: '0.45rem', fontWeight: 700 }}>{m.elo}</td>
                                <td style={{ padding: '0.45rem' }}>{m.arena}%</td>
                                <td style={{ padding: '0.45rem' }}>{m.coding}</td>
                                <td style={{ padding: '0.45rem' }}>{m.reasoning}</td>
                                <td style={{ padding: '0.45rem', color: m.change > 0 ? '#34d399' : m.change < 0 ? '#ef4444' : 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>
                                    {m.change > 0 ? `↑${m.change}` : m.change < 0 ? `↓${Math.abs(m.change)}` : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.5rem' }}>Rankings updated weekly based on community evaluations</div>
        </div>
    );
}
