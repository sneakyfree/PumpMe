// SDK Docs Page

interface Props { onNavigate: (page: string) => void; }

const SDKS = [
    {
        name: 'Python SDK',
        pkg: 'pip install pumpme',
        version: '1.4.2',
        icon: '🐍',
        quickstart: `from pumpme import PumpMe

client = PumpMe(api_key="pm-your-key")

# Chat completion (OpenAI-compatible)
response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-70B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")`,
        features: ['Streaming support', 'Async/await', 'Automatic retries', 'Type hints', 'Session management'],
    },
    {
        name: 'Node.js SDK',
        pkg: 'npm install pumpme',
        version: '2.1.0',
        icon: '📗',
        quickstart: `import PumpMe from 'pumpme';

const client = new PumpMe({ apiKey: 'pm-your-key' });

// Chat completion
const stream = await client.chat.completions.create({
  model: 'meta-llama/Llama-3.1-70B-Instruct',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}`,
        features: ['TypeScript native', 'Edge runtime support', 'ESM + CJS', 'Auto-pagination', 'Streaming'],
    },
    {
        name: 'CLI',
        pkg: 'brew install pumpme/tap/pm',
        version: '0.8.1',
        icon: '⚡',
        quickstart: `# Quick chat
pm chat "What is transformer architecture?"

# Start a session
pm session create --model llama-3.1-70b --gpu a100-80

# View logs
pm session logs <session-id> --follow

# List models
pm models list --sort popularity`,
        features: ['Interactive chat', 'Session management', 'Log streaming', 'JSON output', 'Shell completion'],
    },
];

export default function SdkDocsPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>📚 SDK Documentation</h1>

            {SDKS.map(sdk => (
                <div key={sdk.name} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.3rem' }}>{sdk.icon}</span>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sdk.name}</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginLeft: '0.5rem' }}>v{sdk.version}</span>
                            </div>
                        </div>
                        <code style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', fontSize: '0.7rem', color: '#00d4ff' }}>{sdk.pkg}</code>
                    </div>

                    <pre style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', lineHeight: 1.4, overflow: 'auto', color: '#e2e8f0', marginBottom: '0.75rem' }}>{sdk.quickstart}</pre>

                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {sdk.features.map(f => (
                            <span key={f} style={{ padding: '0.15rem 0.4rem', borderRadius: '12px', fontSize: '0.65rem', background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>✓ {f}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
