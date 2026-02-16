import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const GPUS = [
    { id: 'rtx3090', name: 'RTX 3090', vram: 24, price: 0.30, perf: 142 },
    { id: 'rtx4090', name: 'RTX 4090', vram: 24, price: 0.45, perf: 195 },
    { id: 'a6000', name: 'A6000', vram: 48, price: 0.65, perf: 210 },
    { id: 'l40s', name: 'L40S', vram: 48, price: 0.75, perf: 233 },
    { id: 'a100-40', name: 'A100 40GB', vram: 40, price: 0.80, perf: 275 },
    { id: 'a100-80', name: 'A100 80GB', vram: 80, price: 1.10, perf: 312 },
    { id: 'h100', name: 'H100 80GB', vram: 80, price: 2.49, perf: 520 },
];

export default function CostCalculatorPage({ onNavigate }: Props) {
    const [gpu, setGpu] = useState('a100-80');
    const [hours, setHours] = useState(8);
    const [daysPerWeek, setDaysPerWeek] = useState(5);
    const [sessions, setSessions] = useState(1);

    const selected = GPUS.find(g => g.id === gpu)!;
    const dailyCost = selected.price * hours * sessions;
    const weeklyCost = dailyCost * daysPerWeek;
    const monthlyCost = weeklyCost * 4.33;
    const yearlyCost = monthlyCost * 12;
    const platformFee = 0.05;

    const savings = { monthly: monthlyCost * 0.15, yearly: yearlyCost * 0.20 };

    // Compare vs AWS/GCP
    const cloudMultiplier = { aws: 3.2, gcp: 2.8, azure: 3.0 };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('marketplace')}>← Marketplace</button>
            <h1 style={{ margin: '1rem 0' }}>🧮 Cost Calculator</h1>

            {/* Config */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>GPU Type</label>
                    <select value={gpu} onChange={e => setGpu(e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem' }}>
                        {GPUS.map(g => <option key={g.id} value={g.id}>{g.name} ({g.vram}GB) — ${g.price}/hr</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Hours/Day</label>
                    <input type="range" min={1} max={24} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ display: 'block', width: '100%' }} />
                    <div style={{ fontSize: '0.75rem', color: '#00d4ff', textAlign: 'center' }}>{hours}h</div>
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Days/Week</label>
                    <input type="range" min={1} max={7} value={daysPerWeek} onChange={e => setDaysPerWeek(Number(e.target.value))} style={{ display: 'block', width: '100%' }} />
                    <div style={{ fontSize: '0.75rem', color: '#00d4ff', textAlign: 'center' }}>{daysPerWeek}d</div>
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Concurrent Sessions</label>
                    <input type="range" min={1} max={10} value={sessions} onChange={e => setSessions(Number(e.target.value))} style={{ display: 'block', width: '100%' }} />
                    <div style={{ fontSize: '0.75rem', color: '#00d4ff', textAlign: 'center' }}>{sessions}</div>
                </div>
            </div>

            {/* Cost breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Daily', value: dailyCost },
                    { label: 'Weekly', value: weeklyCost },
                    { label: 'Monthly', value: monthlyCost },
                    { label: 'Yearly', value: yearlyCost },
                ].map(c => (
                    <div key={c.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00d4ff' }}>${c.value.toFixed(2)}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Platform fee note */}
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: '1.5rem' }}>
                + {(platformFee * 100).toFixed(0)}% platform fee · Prices before discounts
            </div>

            {/* Savings with subscription */}
            <div style={{ background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#34d399' }}>💰 Save with Pro/Enterprise</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem' }}>Pro (15% off): <strong style={{ color: '#34d399' }}>-${savings.monthly.toFixed(2)}/mo</strong></div>
                    <div style={{ fontSize: '0.8rem' }}>Enterprise (20% off): <strong style={{ color: '#34d399' }}>-${(savings.yearly / 12).toFixed(2)}/mo</strong></div>
                </div>
            </div>

            {/* Cloud comparison */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>☁️ vs. Cloud Providers (monthly)</div>
                {Object.entries(cloudMultiplier).map(([name, mult]) => {
                    const cloudCost = monthlyCost * mult;
                    const savePct = ((1 - 1 / mult) * 100).toFixed(0);
                    return (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span style={{ width: '50px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>{name}</span>
                            <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ width: `${(1 / mult) * 100}%`, height: '100%', background: 'rgba(0,212,255,0.3)', borderRadius: '4px' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>
                                    ${cloudCost.toFixed(0)} → <span style={{ color: '#34d399', marginLeft: '0.25rem' }}>Save {savePct}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
