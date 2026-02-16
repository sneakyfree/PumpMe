import { useState, useEffect, useCallback } from 'react';

interface Props { currentPage: string; onNavigate: (page: string) => void; }

const ALL_PAGES = [
    // Overview
    { page: 'dashboard', label: 'Dashboard', category: 'Overview', icon: '📊' },
    { page: 'pump', label: 'Start Pumping', category: 'Overview', icon: '🚀' },
    { page: 'activity', label: 'Activity Feed', category: 'Overview', icon: '📰' },
    { page: 'notifications', label: 'Notifications', category: 'Overview', icon: '🔔' },
    // AI Tools
    { page: 'playground', label: 'Playground', category: 'AI Tools', icon: '⚡' },
    { page: 'playground-presets', label: 'Playground Presets', category: 'AI Tools', icon: '⚙️' },
    { page: 'playground-history', label: 'Playground History', category: 'AI Tools', icon: '📜' },
    { page: 'multi-modal', label: 'Multi-Modal', category: 'AI Tools', icon: '🔮' },
    { page: 'image-gen', label: 'Image Generation', category: 'AI Tools', icon: '🎨' },
    { page: 'tts', label: 'Text to Speech', category: 'AI Tools', icon: '🔊' },
    { page: 'embeddings', label: 'Embeddings', category: 'AI Tools', icon: '🧲' },
    { page: 'fine-tuning', label: 'Fine-Tuning', category: 'AI Tools', icon: '🔧' },
    { page: 'batch-jobs', label: 'Batch Jobs', category: 'AI Tools', icon: '📦' },
    { page: 'saved-prompts', label: 'Saved Prompts', category: 'AI Tools', icon: '💾' },
    { page: 'prompt-library', label: 'Prompt Library', category: 'AI Tools', icon: '📚' },
    { page: 'contexts', label: 'Contexts', category: 'AI Tools', icon: '📎' },
    { page: 'eval-suite', label: 'Evaluation Suite', category: 'AI Tools', icon: '📊' },
    // Models
    { page: 'models', label: 'Browse Models', category: 'Models', icon: '🧠' },
    { page: 'model-catalog', label: 'Model Catalog', category: 'Models', icon: '📋' },
    { page: 'model-leaderboard', label: 'Model Leaderboard', category: 'Models', icon: '🏆' },
    { page: 'model-compare', label: 'Compare Models', category: 'Models', icon: '⚖️' },
    { page: 'custom-models', label: 'Custom Models', category: 'Models', icon: '🛠️' },
    { page: 'deployment-logs', label: 'Deployments', category: 'Models', icon: '🚀' },
    { page: 'vram', label: 'VRAM Calculator', category: 'Models', icon: '🧮' },
    { page: 'gpu-compare', label: 'GPU Compare', category: 'Models', icon: '💪' },
    // Analytics
    { page: 'analytics', label: 'Analytics', category: 'Analytics', icon: '📈' },
    { page: 'api-usage', label: 'API Usage', category: 'Analytics', icon: '📡' },
    { page: 'api-request-logs', label: 'Request Logs', category: 'Analytics', icon: '📋' },
    { page: 'inference-logs', label: 'Inference Logs', category: 'Analytics', icon: '🔍' },
    { page: 'cost-breakdown', label: 'Cost Breakdown', category: 'Analytics', icon: '💰' },
    { page: 'cost-calculator', label: 'Cost Calculator', category: 'Analytics', icon: '🧮' },
    { page: 'usage-alerts', label: 'Usage Alerts', category: 'Analytics', icon: '⚠️' },
    { page: 'token-counter', label: 'Token Counter', category: 'Analytics', icon: '🔢' },
    { page: 'benchmarks', label: 'Benchmarks', category: 'Analytics', icon: '📊' },
    // Config
    { page: 'api-keys', label: 'API Keys', category: 'Configuration', icon: '🔑' },
    { page: 'webhooks', label: 'Webhooks', category: 'Configuration', icon: '🔗' },
    { page: 'webhook-logs', label: 'Webhook Logs', category: 'Configuration', icon: '📜' },
    { page: 'guardrails', label: 'Guardrails', category: 'Configuration', icon: '🛡️' },
    { page: 'rate-limits', label: 'Rate Limits', category: 'Configuration', icon: '⏱️' },
    { page: 'caching', label: 'Caching', category: 'Configuration', icon: '💾' },
    { page: 'region-selector', label: 'Regions', category: 'Configuration', icon: '🌍' },
    { page: 'integrations', label: 'Integrations', category: 'Configuration', icon: '🔌' },
    // Org
    { page: 'teams', label: 'Teams', category: 'Organization', icon: '👥' },
    { page: 'org-settings', label: 'Org Settings', category: 'Organization', icon: '🏢' },
    { page: 'billing', label: 'Billing', category: 'Organization', icon: '💳' },
    { page: 'subscription', label: 'Subscription', category: 'Organization', icon: '⭐' },
    { page: 'referrals', label: 'Referrals', category: 'Organization', icon: '🎁' },
    { page: 'invite-tracker', label: 'Invites', category: 'Organization', icon: '✉️' },
    { page: 'data-exports', label: 'Data Exports', category: 'Organization', icon: '📤' },
    { page: 'marketplace', label: 'Marketplace', category: 'Organization', icon: '🛒' },
    // Security
    { page: 'security', label: 'Security', category: 'Security', icon: '🔒' },
    { page: 'audit-trail', label: 'Audit Trail', category: 'Security', icon: '📋' },
    { page: 'audit-log', label: 'Audit Log', category: 'Security', icon: '📝' },
    { page: 'compliance', label: 'Compliance', category: 'Security', icon: '✅' },
    { page: 'trust-safety', label: 'Trust & Safety', category: 'Security', icon: '🛡️' },
    // Developer
    { page: 'dev-portal', label: 'Developer Portal', category: 'Developer', icon: '🛠️' },
    { page: 'docs', label: 'Documentation', category: 'Developer', icon: '📖' },
    { page: 'quickstart', label: 'Quickstart', category: 'Developer', icon: '🚀' },
    { page: 'code-samples', label: 'Code Samples', category: 'Developer', icon: '💻' },
    { page: 'sdk-docs', label: 'SDK Docs', category: 'Developer', icon: '📦' },
    { page: 'api-versioning', label: 'API Versioning', category: 'Developer', icon: '🔄' },
    { page: 'error-codes', label: 'Error Codes', category: 'Developer', icon: '❌' },
    { page: 'migration', label: 'Migration Guide', category: 'Developer', icon: '📋' },
    { page: 'glossary', label: 'Glossary', category: 'Developer', icon: '📖' },
    // Resources
    { page: 'blog', label: 'Blog', category: 'Resources', icon: '✍️' },
    { page: 'changelog', label: 'Changelog', category: 'Resources', icon: '📋' },
    { page: 'release-notes', label: 'Release Notes', category: 'Resources', icon: '📋' },
    { page: 'roadmap', label: 'Roadmap', category: 'Resources', icon: '🗺️' },
    { page: 'faq', label: 'FAQ', category: 'Resources', icon: '❓' },
    { page: 'help', label: 'Help Center', category: 'Resources', icon: '🆘' },
    { page: 'support-tickets', label: 'Support Tickets', category: 'Resources', icon: '🎫' },
    { page: 'community', label: 'Community', category: 'Resources', icon: '🌐' },
    { page: 'feedback', label: 'Feedback', category: 'Resources', icon: '💬' },
    // Company
    { page: 'about', label: 'About', category: 'Company', icon: '💡' },
    { page: 'careers', label: 'Careers', category: 'Company', icon: '👔' },
    { page: 'contact', label: 'Contact', category: 'Company', icon: '📧' },
    { page: 'partners', label: 'Partners', category: 'Company', icon: '🤝' },
    { page: 'open-source', label: 'Open Source', category: 'Company', icon: '🌐' },
    { page: 'enterprise', label: 'Enterprise', category: 'Company', icon: '🏢' },
    // Infrastructure
    { page: 'status', label: 'System Status', category: 'Infrastructure', icon: '🟢' },
    { page: 'uptime', label: 'Uptime Monitor', category: 'Infrastructure', icon: '📈' },
    { page: 'system-health', label: 'System Health', category: 'Infrastructure', icon: '❤️' },
    { page: 'incident-history', label: 'Incidents', category: 'Infrastructure', icon: '🚨' },
    { page: 'data-centers', label: 'Data Centers', category: 'Infrastructure', icon: '🏗️' },
    { page: 'network-peering', label: 'Network Peering', category: 'Infrastructure', icon: '🌐' },
    { page: 'sla', label: 'SLA', category: 'Infrastructure', icon: '📃' },
    // Account
    { page: 'profile', label: 'Profile', category: 'Account', icon: '👤' },
    { page: 'settings', label: 'Settings', category: 'Account', icon: '⚙️' },
    { page: 'preferences', label: 'Preferences', category: 'Account', icon: '🎛️' },
    { page: 'history', label: 'Session History', category: 'Account', icon: '📜' },
    { page: 'session-logs', label: 'Session Logs', category: 'Account', icon: '📝' },
    { page: 'shortcuts', label: 'Keyboard Shortcuts', category: 'Account', icon: '⌨️' },
    { page: 'storage', label: 'Storage', category: 'Account', icon: '💾' },
    { page: 'export', label: 'Export Data', category: 'Account', icon: '📤' },
    // Legal
    { page: 'terms', label: 'Terms of Service', category: 'Legal', icon: '📃' },
    { page: 'privacy', label: 'Privacy Policy', category: 'Legal', icon: '🔐' },
    { page: 'aup', label: 'Acceptable Use', category: 'Legal', icon: '📜' },
    { page: 'pricing', label: 'Pricing', category: 'Legal', icon: '💰' },
];

export default function CommandPalette({ currentPage, onNavigate }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);

    const filtered = query.trim()
        ? ALL_PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()) || p.page.includes(query.toLowerCase()))
        : ALL_PAGES.filter(p => p.page !== currentPage).slice(0, 12);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); setQuery(''); setSelectedIdx(0); }
        if (e.key === 'Escape') setOpen(false);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!open) return null;

    return (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '500px', maxHeight: '60vh', background: 'rgba(20,20,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }} placeholder="Search pages... (Ctrl+K)" style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} onKeyDown={e => {
                        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
                        if (e.key === 'Enter' && filtered[selectedIdx]) { onNavigate(filtered[selectedIdx].page); setOpen(false); }
                    }} />
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 'calc(60vh - 60px)' }}>
                    {filtered.slice(0, 20).map((p, i) => (
                        <div key={p.page} onClick={() => { onNavigate(p.page); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', background: i === selectedIdx ? 'rgba(0,212,255,0.08)' : 'transparent', borderLeft: i === selectedIdx ? '2px solid #00d4ff' : '2px solid transparent' }}>
                            <span style={{ fontSize: '1rem' }}>{p.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: i === selectedIdx ? '#00d4ff' : '#fff' }}>{p.label}</div>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{p.category}</div>
                            </div>
                            {p.page === currentPage && <span style={{ fontSize: '0.55rem', color: '#34d399' }}>current</span>}
                        </div>
                    ))}
                    {filtered.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No pages found</div>}
                </div>
            </div>
        </div>
    );
}
