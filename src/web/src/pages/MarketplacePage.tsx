import { useState, useEffect } from 'react';

interface GpuListing { id: string; provider: string; gpuType: string; gpuCount: number; vramGb: number; cpuCores: number; ramGb: number; storageGb: number; pricePerHour: number; region: string; availability: string; reliability: number; dlPerf: number; }
interface Props { onNavigate: (page: string) => void; }

export default function MarketplacePage({ onNavigate }: Props) {
    const [listings, setListings] = useState<GpuListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('price_asc');
    const [filterAvail, setFilterAvail] = useState('all');
    const [filterProvider, setFilterProvider] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => { loadListings(); }, [sort, filterAvail, filterProvider, maxPrice]);

    const loadListings = async () => {
        const params = new URLSearchParams({ sort });
        if (filterAvail !== 'all') params.set('availability', filterAvail);
        if (filterProvider) params.set('provider', filterProvider);
        if (maxPrice) params.set('maxPrice', maxPrice);
        try {
            const res = await fetch(`/api/marketplace?${params}`);
            if (res.ok) { const d = await res.json(); setListings(d.data?.listings || []); }
        } catch { /* */ }
        setLoading(false);
    };

    const AVAIL_COLORS: Record<string, string> = { available: '#34d399', limited: '#f59e0b', sold_out: '#ef4444' };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1 style={{ margin: '1rem 0' }}>🖥️ GPU Marketplace</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Browse {listings.length} GPU instances across multiple providers.
            </p>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                    <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Sort</label>
                    <select value={sort} onChange={e => setSort(e.target.value)} style={{ display: 'block', padding: '0.35rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }}>
                        <option value="price_asc">Price ↑</option>
                        <option value="price_desc">Price ↓</option>
                        <option value="vram">VRAM ↓</option>
                        <option value="perf">Perf ↓</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Availability</label>
                    <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)} style={{ display: 'block', padding: '0.35rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }}>
                        <option value="all">All</option>
                        <option value="available">Available</option>
                        <option value="limited">Limited</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Provider</label>
                    <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} style={{ display: 'block', padding: '0.35rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }}>
                        <option value="">All</option>
                        <option value="Vast.ai">Vast.ai</option>
                        <option value="RunPod">RunPod</option>
                        <option value="Lambda">Lambda Labs</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Max $/hr</label>
                    <input type="number" step="0.1" placeholder="∞" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ display: 'block', width: '60px', padding: '0.35rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.75rem' }} />
                </div>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

            {/* GPU Cards */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {listings.map(gpu => (
                    <div key={gpu.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{gpu.gpuType}</span>
                                {gpu.gpuCount > 1 && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: 'rgba(124,58,237,0.15)', color: '#a855f7' }}>×{gpu.gpuCount}</span>}
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: `${AVAIL_COLORS[gpu.availability]}15`, color: AVAIL_COLORS[gpu.availability] }}>{gpu.availability}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                                <span>📦 {gpu.vramGb}GB VRAM</span>
                                <span>🧠 {gpu.cpuCores} cores</span>
                                <span>💾 {gpu.ramGb}GB RAM</span>
                                <span>💽 {gpu.storageGb}GB SSD</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>
                                <span>{gpu.provider}</span>
                                <span>{gpu.region}</span>
                                <span>⚡ {gpu.dlPerf} TFLOPS</span>
                                <span>✅ {gpu.reliability}% uptime</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.25rem' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4ff' }}>${gpu.pricePerHour.toFixed(2)}<span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>/hr</span></div>
                            <button className="btn btn-primary" onClick={() => onNavigate('pump')} disabled={gpu.availability === 'sold_out'} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                {gpu.availability === 'sold_out' ? 'Sold Out' : '🚀 Launch'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
