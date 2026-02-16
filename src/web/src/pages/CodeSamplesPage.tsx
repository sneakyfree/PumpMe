import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface Snippet { id: string; title: string; language: string; code: string; desc: string; }

const SNIPPETS: Snippet[] = [
    { id: 's-1', title: 'Chat Completion', language: 'python', desc: 'Basic chat completion request', code: `import pumpme\n\nclient = pumpme.Client(api_key="pm-...")\nresponse = client.chat.completions.create(\n    model="llama-3.1-70b",\n    messages=[{"role": "user", "content": "Hello!"}],\n    max_tokens=256\n)\nprint(response.choices[0].message.content)` },
    { id: 's-2', title: 'Streaming Response', language: 'python', desc: 'Stream tokens as they are generated', code: `stream = client.chat.completions.create(\n    model="mistral-7b",\n    messages=[{"role": "user", "content": "Write a poem"}],\n    stream=True\n)\nfor chunk in stream:\n    print(chunk.choices[0].delta.content, end="")` },
    { id: 's-3', title: 'Node.js SDK', language: 'javascript', desc: 'Using the Node.js client library', code: `import PumpMe from 'pumpme';\n\nconst client = new PumpMe({ apiKey: 'pm-...' });\nconst res = await client.chat.completions.create({\n  model: 'llama-3.1-70b',\n  messages: [{ role: 'user', content: 'Hello!' }]\n});\nconsole.log(res.choices[0].message.content);` },
    { id: 's-4', title: 'cURL Request', language: 'bash', desc: 'Direct HTTP API call', code: `curl https://api.pumpme.ai/v1/chat/completions \\\n  -H "Authorization: Bearer pm-..." \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "llama-3.1-70b",\n    "messages": [{"role":"user","content":"Hello!"}]\n  }'` },
    { id: 's-5', title: 'Embeddings', language: 'python', desc: 'Generate vector embeddings', code: `embeddings = client.embeddings.create(\n    model="e5-mistral-7b",\n    input="The quick brown fox",\n    dimensions=1024\n)\nprint(len(embeddings.data[0].embedding))  # 1024` },
    { id: 's-6', title: 'Function Calling', language: 'python', desc: 'Define and use tool functions', code: `tools = [{\n    "type": "function",\n    "function": {\n        "name": "get_weather",\n        "parameters": {"type":"object","properties":{"city":{"type":"string"}}}\n    }\n}]\nres = client.chat.completions.create(\n    model="llama-3.1-70b",\n    messages=[{"role":"user","content":"Weather in NYC?"}],\n    tools=tools\n)` },
];

const LANG_COLORS: Record<string, string> = { python: '#3572A5', javascript: '#f1e05a', bash: '#89e051' };

export default function CodeSamplesPage({ onNavigate }: Props) {
    const [lang, setLang] = useState('all');
    const filtered = lang === 'all' ? SNIPPETS : SNIPPETS.filter(s => s.language === lang);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>💻 Code Samples</h1>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {['all', 'python', 'javascript', 'bash'].map(l => (
                    <button key={l} onClick={() => setLang(l)} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', background: lang === l ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: lang === l ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>{l}</button>
                ))}
            </div>

            {filtered.map(s => (
                <div key={s.id} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: LANG_COLORS[s.language] || '#fff' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.title}</span>
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{s.language}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem' }}>{s.desc}</div>
                    <pre style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '0.7rem', color: '#e2e8f0', overflow: 'auto', maxHeight: '150px', lineHeight: 1.4 }}>{s.code}</pre>
                </div>
            ))}
        </div>
    );
}
