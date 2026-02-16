// Migration Guide Page

interface Props { onNavigate: (page: string) => void; }

interface MigrationPath { from: string; icon: string; difficulty: 'Easy' | 'Medium'; timeEst: string; steps: string[]; codeChange: string; }

const PATHS: MigrationPath[] = [
    {
        from: 'OpenAI', icon: '🤖', difficulty: 'Easy', timeEst: '2 minutes',
        steps: ['Get a PumpMe API key', 'Change base_url to api.pumpme.io/v1', 'Update model name', 'Done!'],
        codeChange: `# Before (OpenAI)
client = OpenAI(api_key="sk-...")

# After (PumpMe) — just 2 lines changed
client = OpenAI(
    base_url="https://api.pumpme.io/v1",
    api_key="pm-your-key"
)`,
    },
    {
        from: 'Replicate', icon: '🔄', difficulty: 'Easy', timeEst: '5 minutes',
        steps: ['Install openai SDK', 'Replace replicate.run() with chat completions', 'Use PumpMe model IDs', 'Remove replicate dependency'],
        codeChange: `# Before (Replicate)
import replicate
output = replicate.run("meta/llama-2-70b-chat")

# After (PumpMe)
from openai import OpenAI
client = OpenAI(base_url="https://api.pumpme.io/v1", api_key="pm-key")
response = client.chat.completions.create(model="meta-llama/Llama-3.1-70B-Instruct", ...)`,
    },
    {
        from: 'Together AI', icon: '🤝', difficulty: 'Easy', timeEst: '2 minutes',
        steps: ['Change base_url to PumpMe', 'Update API key', 'Model names are the same!'],
        codeChange: `# Before (Together)
client = OpenAI(base_url="https://api.together.xyz/v1", api_key="tog-...")

# After (PumpMe) — same format!
client = OpenAI(base_url="https://api.pumpme.io/v1", api_key="pm-...")`,
    },
    {
        from: 'Hugging Face Inference', icon: '🤗', difficulty: 'Medium', timeEst: '10 minutes',
        steps: ['Install openai SDK', 'Replace InferenceClient with OpenAI client', 'Map model names', 'Update response parsing'],
        codeChange: `# Before (Hugging Face)
from huggingface_hub import InferenceClient
client = InferenceClient(model="meta-llama/Llama-3.1-70B-Instruct")

# After (PumpMe)
from openai import OpenAI
client = OpenAI(base_url="https://api.pumpme.io/v1", api_key="pm-key")`,
    },
];

export default function MigrationGuidePage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('quickstart')}>← Quickstart</button>
            <h1 style={{ margin: '1rem 0' }}>🔀 Migration Guide</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Switch to PumpMe from any provider in minutes. Our OpenAI-compatible API makes it easy.
            </p>

            {PATHS.map(path => (
                <div key={path.from} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.3rem' }}>{path.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>From {path.from}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{path.timeEst} · {path.difficulty}</div>
                            </div>
                        </div>
                        <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, background: path.difficulty === 'Easy' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: path.difficulty === 'Easy' ? '#34d399' : '#f59e0b' }}>{path.difficulty}</span>
                    </div>

                    <ol style={{ margin: '0 0 0.75rem 1.2rem', padding: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                        {path.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>

                    <pre style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', lineHeight: 1.4, overflow: 'auto', color: '#e2e8f0' }}>{path.codeChange}</pre>
                </div>
            ))}
        </div>
    );
}
