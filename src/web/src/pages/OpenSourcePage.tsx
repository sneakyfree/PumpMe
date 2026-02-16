// Open Source Page

interface Props { onNavigate: (page: string) => void; }

interface Repo { name: string; desc: string; stars: number; lang: string; langColor: string; license: string; }

const REPOS: Repo[] = [
    { name: 'pumpme-sdk-python', desc: 'Official Python SDK for the PumpMe API. OpenAI-compatible with streaming and async support.', stars: 1245, lang: 'Python', langColor: '#3572A5', license: 'MIT' },
    { name: 'pumpme-sdk-node', desc: 'Official Node.js/TypeScript SDK. Full type safety with automatic retries.', stars: 876, lang: 'TypeScript', langColor: '#3178C6', license: 'MIT' },
    { name: 'pumpme-cli', desc: 'Command-line interface for managing sessions, deploying models, and viewing logs.', stars: 534, lang: 'Go', langColor: '#00ADD8', license: 'Apache-2.0' },
    { name: 'gpu-benchmark-suite', desc: 'Open-source GPU benchmarking tools used for our published benchmarks.', stars: 2103, lang: 'Python', langColor: '#3572A5', license: 'MIT' },
    { name: 'vllm-pumpme', desc: 'Fork of vLLM with PumpMe-specific optimizations for multi-tenant serving.', stars: 423, lang: 'Python', langColor: '#3572A5', license: 'Apache-2.0' },
    { name: 'langchain-pumpme', desc: 'LangChain integration package for PumpMe as a custom LLM provider.', stars: 312, lang: 'Python', langColor: '#3572A5', license: 'MIT' },
    { name: 'pumpme-terraform', desc: 'Terraform provider for managing PumpMe infrastructure as code.', stars: 189, lang: 'Go', langColor: '#00ADD8', license: 'MPL-2.0' },
    { name: 'model-eval-harness', desc: 'Evaluation framework for comparing model quality across providers.', stars: 756, lang: 'Python', langColor: '#3572A5', license: 'MIT' },
];

export default function OpenSourcePage({ onNavigate }: Props) {
    const totalStars = REPOS.reduce((sum, r) => sum + r.stars, 0);

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('community')}>← Community</button>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <h1 style={{ fontSize: '1.5rem' }}>📦 Open Source</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                    We believe in building in the open. {totalStars.toLocaleString()} total ⭐ across {REPOS.length} repos.
                </p>
            </div>

            {REPOS.map(repo => (
                <div key={repo.name} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#00d4ff' }}>{repo.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem', lineHeight: 1.4 }}>{repo.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem' }}>⭐ {repo.stars.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
                        <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: repo.langColor, marginRight: '0.25rem' }} />{repo.lang}</span>
                        <span>📄 {repo.license}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
