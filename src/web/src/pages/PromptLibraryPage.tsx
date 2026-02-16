import { useState } from 'react';

interface Props { onNavigate: (page: string) => void; }

interface PromptTemplate { id: string; title: string; category: string; prompt: string; vars: string[]; uses: number; }

const TEMPLATES: PromptTemplate[] = [
    { id: 'pt-1', title: 'Code Reviewer', category: 'Development', prompt: 'Review the following {{language}} code for bugs, security issues, and performance improvements:\n\n```{{language}}\n{{code}}\n```\n\nProvide specific line-by-line feedback.', vars: ['language', 'code'], uses: 4520 },
    { id: 'pt-2', title: 'Email Summarizer', category: 'Productivity', prompt: 'Summarize the following email thread in 3 bullet points, focusing on action items and decisions:\n\n{{email_thread}}', vars: ['email_thread'], uses: 3210 },
    { id: 'pt-3', title: 'SQL Generator', category: 'Development', prompt: 'You are a {{database}} expert. Given this schema:\n{{schema}}\n\nWrite a query to: {{request}}\n\nReturn only the SQL, no explanation.', vars: ['database', 'schema', 'request'], uses: 2890 },
    { id: 'pt-4', title: 'Product Description', category: 'Marketing', prompt: 'Write a compelling {{tone}} product description for:\nProduct: {{product_name}}\nFeatures: {{features}}\nTarget audience: {{audience}}\n\nKeep it under 150 words.', vars: ['tone', 'product_name', 'features', 'audience'], uses: 1760 },
    { id: 'pt-5', title: 'Bug Report Parser', category: 'Development', prompt: 'Parse this bug report into structured JSON with fields: severity, component, steps_to_reproduce, expected_behavior, actual_behavior:\n\n{{bug_report}}', vars: ['bug_report'], uses: 980 },
    { id: 'pt-6', title: 'Meeting Notes', category: 'Productivity', prompt: 'Convert these meeting notes into a structured summary with: attendees, discussion points, decisions made, and action items with owners and deadlines:\n\n{{notes}}', vars: ['notes'], uses: 2340 },
];

export default function PromptLibraryPage({ onNavigate }: Props) {
    const [cat, setCat] = useState('All');
    const [search, setSearch] = useState('');
    const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
    const filtered = TEMPLATES.filter(t => (cat === 'All' || t.category === cat) && t.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('saved-prompts')}>← Saved Prompts</button>
            <h1 style={{ margin: '1rem 0' }}>📚 Prompt Library</h1>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." style={{ flex: 1, minWidth: '150px', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem' }} />
                {categories.map(c => (
                    <button key={c} onClick={() => setCat(c)} style={{ padding: '0.3rem 0.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, background: cat === c ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: cat === c ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>{c}</button>
                ))}
            </div>

            {filtered.map(t => (
                <div key={t.id} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.3rem' }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.title}</span>
                            <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.25rem', borderRadius: '3px', background: 'rgba(0,212,255,0.08)', color: '#00d4ff', marginLeft: '0.4rem' }}>{t.category}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>🔥 {t.uses.toLocaleString()} uses</span>
                    </div>
                    <pre style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '0.7rem', color: '#e2e8f0', overflow: 'auto', maxHeight: '80px', lineHeight: 1.4 }}>{t.prompt}</pre>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {t.vars.map(v => <code key={v} style={{ padding: '0.05rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{`{{${v}}}`}</code>)}
                        </div>
                        <button className="btn btn-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }} onClick={() => onNavigate('playground')}>Use →</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
