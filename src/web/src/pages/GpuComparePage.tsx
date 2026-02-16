import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const GPUS = [
    { id: 'rtx3090', name: 'RTX 3090', arch: 'Ampere', vram: 24, memBw: 936, tflops: 35.6, dlPerf: 142, tdp: 350, price: 0.30, gen: 2020 },
    { id: 'rtx4090', name: 'RTX 4090', arch: 'Ada', vram: 24, memBw: 1008, tflops: 82.6, dlPerf: 195, tdp: 450, price: 0.45, gen: 2022 },
    { id: 'a6000', name: 'A6000', arch: 'Ampere', vram: 48, memBw: 768, tflops: 38.7, dlPerf: 210, tdp: 300, price: 0.65, gen: 2020 },
    { id: 'l40s', name: 'L40S', arch: 'Ada', vram: 48, memBw: 864, tflops: 91.6, dlPerf: 233, tdp: 350, price: 0.75, gen: 2023 },
    { id: 'a100-40', name: 'A100 40GB', arch: 'Ampere', vram: 40, memBw: 1555, tflops: 19.5, dlPerf: 275, tdp: 400, price: 0.80, gen: 2020 },
    { id: 'a100-80', name: 'A100 80GB', arch: 'Ampere', vram: 80, memBw: 2039, tflops: 19.5, dlPerf: 312, tdp: 400, price: 1.10, gen: 2021 },
    { id: 'h100', name: 'H100 80GB', arch: 'Hopper', vram: 80, memBw: 3350, tflops: 51.2, dlPerf: 520, tdp: 700, price: 2.49, gen: 2023 },
];

export default function GpuComparePage({ onNavigate }: Props) {
    const [selected, setSelected] = useState<string[]>(['rtx4090', 'a100-80', 'h100']);

    const toggle = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
    };

    const compared = GPUS.filter(g => selected.includes(g.id));
    const maxPerf = Math.max(...compared.map(g => g.dlPerf));

    const specs: { label: string; key: string; unit: string; higher: boolean }[] = [
        { label: 'Architecture', key: 'arch', unit: '', higher: false },
        { label: 'VRAM', key: 'vram', unit: 'GB', higher: true },
        { label: 'Memory BW', key: 'memBw', unit: 'GB/s', higher: true },
        { label: 'FP32 TFLOPS', key: 'tflops', unit: '', higher: true },
        { label: 'DL Performance', key: 'dlPerf', unit: 'score', higher: true },
        { label: 'TDP', key: 'tdp', unit: 'W', higher: false },
        { label: 'Price/hr', key: 'price', unit: '$', higher: false },
        { label: 'Generation', key: 'gen', unit: '', higher: true },
    ];

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('marketplace')}>← Marketplace</button>
            <h1 style={{ margin: '1rem 0' }}>⚔️ GPU Compare</h1>

            {/* GPU selector */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {GPUS.map(g => (
                    <button key={g.id} onClick={() => toggle(g.id)} style={{
                        padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                        background: selected.includes(g.id) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: selected.includes(g.id) ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                    }}>{g.name}</button>
                ))}
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', alignSelf: 'center' }}>Max 4</span>
            </div>

            {/* Performance bars */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>⚡ DL Performance Score</div>
                {compared.map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ width: '90px', fontSize: '0.8rem', fontWeight: 600 }}>{g.name}</span>
                        <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: `${(g.dlPerf / maxPerf) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', borderRadius: '4px' }} />
                            <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 600 }}>{g.dlPerf}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Spec comparison table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={{ textAlign: 'left', padding: '0.4rem', color: 'rgba(255,255,255,0.3)' }}>Spec</th>
                            {compared.map(g => <th key={g.id} style={{ textAlign: 'center', padding: '0.4rem', color: '#00d4ff' }}>{g.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {specs.map(s => {
                            const values = compared.map(g => (g as Record<string, unknown>)[s.key] as number | string);
                            const numVals = values.filter(v => typeof v === 'number') as number[];
                            const best = s.higher ? Math.max(...numVals) : Math.min(...numVals);
                            return (
                                <tr key={s.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.35rem 0.4rem', color: 'rgba(255,255,255,0.5)' }}>{s.label}</td>
                                    {compared.map((g, i) => {
                                        const val = values[i];
                                        const isBest = typeof val === 'number' && val === best && numVals.length > 1;
                                        return (
                                            <td key={g.id} style={{ textAlign: 'center', padding: '0.35rem', color: isBest ? '#34d399' : '#fff', fontWeight: isBest ? 700 : 400 }}>
                                                {s.key === 'price' ? `$${val}` : `${val}${s.unit ? ` ${s.unit}` : ''}`}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Value score */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>💰 Value Score (Perf/$ per hour)</div>
                {compared.sort((a, b) => (b.dlPerf / b.price) - (a.dlPerf / a.price)).map(g => {
                    const score = Math.round(g.dlPerf / g.price);
                    const maxScore = Math.max(...compared.map(c => Math.round(c.dlPerf / c.price)));
                    return (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ width: '90px', fontSize: '0.8rem' }}>{g.name}</span>
                            <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${(score / maxScore) * 100}%`, height: '100%', background: '#34d399', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '40px', textAlign: 'right' }}>{score}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
