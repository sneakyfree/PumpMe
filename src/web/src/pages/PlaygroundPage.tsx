import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

const EXAMPLE_PROMPTS = [
    'Write a haiku about GPU computing',
    'Explain transformers in 3 sentences',
    'Compare PyTorch vs TensorFlow for beginners',
    'Write Python code for a simple chatbot',
];

export default function PlaygroundPage({ onNavigate }: Props) {
    const [model, setModel] = useState('meta-llama/Llama-3.1-70B-Instruct');
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [temp, setTemp] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(256);
    const [tab, setTab] = useState<'chat' | 'curl' | 'python'>('chat');

    const models = [
        'meta-llama/Llama-3.1-70B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'codellama/CodeLlama-34b-Instruct-hf',
        'meta-llama/Llama-3.2-3B-Instruct',
    ];

    const run = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResponse('');
        // Simulate streaming response
        const words = 'This is a simulated response from the PumpMe API playground. In production, this would stream real tokens from the selected model running on a GPU. The response demonstrates the OpenAI-compatible API format with streaming support, temperature control, and token limits.'.split(' ');
        for (let i = 0; i < Math.min(words.length, maxTokens / 4); i++) {
            await new Promise(r => setTimeout(r, 50));
            setResponse(prev => prev + (i > 0 ? ' ' : '') + words[i]);
        }
        setLoading(false);
    };

    const curlCode = `curl -X POST https://api.pumpme.io/v1/chat/completions \\
  -H "Authorization: Bearer pm-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "${prompt.replace(/'/g, "\\'")}"}],
    "temperature": ${temp},
    "max_tokens": ${maxTokens},
    "stream": true
  }'`;

    const pythonCode = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.pumpme.io/v1",
    api_key="pm-your-api-key"
)

response = client.chat.completions.create(
    model="${model}",
    messages=[{"role": "user", "content": "${prompt}"}],
    temperature=${temp},
    max_tokens=${maxTokens},
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")`;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>🧪 API Playground</h1>

            {/* Model + params */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Model</label>
                    <select value={model} onChange={e => setModel(e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }}>
                        {models.map(m => <option key={m} value={m}>{m.split('/').pop()}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Temperature: {temp}</label>
                    <input type="range" min={0} max={2} step={0.1} value={temp} onChange={e => setTemp(Number(e.target.value))} style={{ display: 'block', width: '100%', marginTop: '0.5rem' }} />
                </div>
                <div>
                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Max Tokens: {maxTokens}</label>
                    <input type="range" min={64} max={2048} step={64} value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} style={{ display: 'block', width: '100%', marginTop: '0.5rem' }} />
                </div>
            </div>

            {/* Quick prompts */}
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {EXAMPLE_PROMPTS.map(p => (
                    <button key={p} onClick={() => setPrompt(p)} style={{ padding: '0.2rem 0.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>{p}</button>
                ))}
            </div>

            {/* Input */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter your prompt..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }} />
                <button onClick={run} disabled={loading || !prompt.trim()} style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: '#00d4ff', color: '#000', fontWeight: 600, fontSize: '0.8rem', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1 }}>
                    {loading ? '⏳ Running...' : '▶ Run'}
                </button>
            </div>

            {/* Response */}
            {response && (
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                    {response}{loading && <span style={{ animation: 'blink 1s infinite' }}>▊</span>}
                </div>
            )}

            {/* Code tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {(['chat', 'curl', 'python'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '0.3rem 0.6rem', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'capitalize',
                        background: tab === t ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.02)', color: tab === t ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    }}>{t}</button>
                ))}
            </div>
            {tab !== 'chat' && (
                <pre style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0 10px 10px 10px', padding: '0.75rem', fontSize: '0.75rem', lineHeight: 1.4, overflow: 'auto', color: '#e2e8f0' }}>
                    {tab === 'curl' ? curlCode : pythonCode}
                </pre>
            )}
        </div>
    );
}
