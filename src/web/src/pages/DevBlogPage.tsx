// Dev Blog Page

interface Props { onNavigate: (page: string) => void; }

const POSTS = [
    {
        title: 'Introducing H100 Support: 2x Faster Inference',
        date: 'Feb 7, 2026',
        category: 'Product',
        excerpt: 'H100 80GB GPUs are now available across all providers. Benchmarks show 2x faster inference for Llama 3.1 70B compared to A100.',
        readTime: '4 min',
        slug: 'h100-support',
    },
    {
        title: 'Building PumpMe\'s Circuit Breaker: Zero-Downtime Failover',
        date: 'Feb 3, 2026',
        category: 'Engineering',
        excerpt: 'How we implemented automatic failover across GPU providers, achieving 99.95% uptime even when individual providers go down.',
        readTime: '8 min',
        slug: 'circuit-breaker',
    },
    {
        title: 'OpenAI-Compatible API: Drop-in Replacement Guide',
        date: 'Jan 28, 2026',
        category: 'Tutorial',
        excerpt: 'Switch from OpenAI to PumpMe in 2 lines of code. Full compatibility with the chat completions, embeddings, and streaming APIs.',
        readTime: '5 min',
        slug: 'openai-compatible',
    },
    {
        title: 'GPU Pricing Update: A100 Now $1.10/hr',
        date: 'Jan 20, 2026',
        category: 'Product',
        excerpt: 'We\'ve negotiated better rates with our providers. A100 80GB pricing drops 15% to $1.10/hr, making enterprise inference more affordable.',
        readTime: '2 min',
        slug: 'pricing-update',
    },
    {
        title: 'How We Serve 2M+ GPU Hours Per Month',
        date: 'Jan 12, 2026',
        category: 'Engineering',
        excerpt: 'A deep dive into our orchestration layer, smart routing, and the distributed systems powering PumpMe at scale.',
        readTime: '12 min',
        slug: 'scale-architecture',
    },
    {
        title: 'Fine-Tuning Made Simple: LoRA on PumpMe',
        date: 'Jan 5, 2026',
        category: 'Tutorial',
        excerpt: 'Step-by-step guide to fine-tuning Llama 3.1 with LoRA adapters on PumpMe. From dataset prep to deployment in 30 minutes.',
        readTime: '10 min',
        slug: 'lora-finetuning',
    },
];

const CATEGORY_COLORS: Record<string, string> = { Product: '#00d4ff', Engineering: '#7c3aed', Tutorial: '#34d399' };

export default function DevBlogPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('home')}>← Home</button>
            <h1 style={{ margin: '1rem 0' }}>📝 Developer Blog</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Engineering deep dives, product updates, and tutorials from the PumpMe team.
            </p>

            {POSTS.map((post) => (
                <article key={post.slug} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, background: `${CATEGORY_COLORS[post.category]}15`, color: CATEGORY_COLORS[post.category] }}>{post.category}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{post.date} · {post.readTime} read</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{post.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>{post.excerpt}</p>
                </article>
            ))}

            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Subscribe for updates</p>
                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '350px', margin: '0 auto' }}>
                    <input placeholder="your@email.com" style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }} />
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Subscribe</button>
                </div>
            </div>
        </div>
    );
}
