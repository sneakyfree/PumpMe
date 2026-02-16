import { useState } from 'react';

interface Props {
    currentPage: string;
    onNavigate: (page: string) => void;
    isLoggedIn: boolean;
}

interface NavSection {
    label: string;
    icon: string;
    items: { page: string; label: string; icon: string }[];
}

const AUTH_SECTIONS: NavSection[] = [
    {
        label: 'Overview', icon: '📊', items: [
            { page: 'dashboard', label: 'Dashboard', icon: '📊' },
            { page: 'pump', label: 'Start Pumping', icon: '🚀' },
            { page: 'activity', label: 'Activity Feed', icon: '📰' },
            { page: 'notifications', label: 'Notifications', icon: '🔔' },
        ]
    },
    {
        label: 'AI Tools', icon: '🤖', items: [
            { page: 'playground', label: 'Playground', icon: '⚡' },
            { page: 'playground-presets', label: 'Presets', icon: '⚙️' },
            { page: 'playground-history', label: 'History', icon: '📜' },
            { page: 'multi-modal', label: 'Multi-Modal', icon: '🔮' },
            { page: 'image-gen', label: 'Image Gen', icon: '🎨' },
            { page: 'tts', label: 'Text to Speech', icon: '🔊' },
            { page: 'embeddings', label: 'Embeddings', icon: '🧲' },
            { page: 'fine-tuning', label: 'Fine-Tuning', icon: '🔧' },
            { page: 'batch-jobs', label: 'Batch Jobs', icon: '📦' },
        ]
    },
    {
        label: 'Models', icon: '🧠', items: [
            { page: 'models', label: 'Browse Models', icon: '🧠' },
            { page: 'model-catalog', label: 'Model Catalog', icon: '📋' },
            { page: 'model-leaderboard', label: 'Leaderboard', icon: '🏆' },
            { page: 'model-compare', label: 'Compare', icon: '⚖️' },
            { page: 'custom-models', label: 'Custom Models', icon: '🛠️' },
            { page: 'deployment-logs', label: 'Deployments', icon: '🚀' },
        ]
    },
    {
        label: 'Analytics', icon: '📈', items: [
            { page: 'analytics', label: 'Analytics', icon: '📈' },
            { page: 'api-usage', label: 'API Usage', icon: '📡' },
            { page: 'api-request-logs', label: 'Request Logs', icon: '📋' },
            { page: 'inference-logs', label: 'Inference Logs', icon: '🔍' },
            { page: 'cost-breakdown', label: 'Cost Breakdown', icon: '💰' },
            { page: 'usage-alerts', label: 'Usage Alerts', icon: '⚠️' },
            { page: 'token-counter', label: 'Token Counter', icon: '🔢' },
        ]
    },
    {
        label: 'Configuration', icon: '⚙️', items: [
            { page: 'api-keys', label: 'API Keys', icon: '🔑' },
            { page: 'webhooks', label: 'Webhooks', icon: '🔗' },
            { page: 'webhook-logs', label: 'Webhook Logs', icon: '📜' },
            { page: 'guardrails', label: 'Guardrails', icon: '🛡️' },
            { page: 'rate-limits', label: 'Rate Limits', icon: '⏱️' },
            { page: 'caching', label: 'Caching', icon: '💾' },
            { page: 'contexts', label: 'Contexts', icon: '📎' },
            { page: 'region-selector', label: 'Regions', icon: '🌍' },
        ]
    },
    {
        label: 'Organization', icon: '🏢', items: [
            { page: 'teams', label: 'Teams', icon: '👥' },
            { page: 'org-settings', label: 'Org Settings', icon: '🏢' },
            { page: 'billing', label: 'Billing', icon: '💳' },
            { page: 'subscription', label: 'Subscription', icon: '⭐' },
            { page: 'referrals', label: 'Referrals', icon: '🎁' },
            { page: 'invite-tracker', label: 'Invites', icon: '✉️' },
            { page: 'data-exports', label: 'Data Exports', icon: '📤' },
        ]
    },
    {
        label: 'Security', icon: '🔒', items: [
            { page: 'security', label: 'Security', icon: '🔒' },
            { page: 'audit-trail', label: 'Audit Trail', icon: '📋' },
            { page: 'compliance', label: 'Compliance', icon: '✅' },
            { page: 'trust-safety', label: 'Trust & Safety', icon: '🛡️' },
        ]
    },
    {
        label: 'Account', icon: '👤', items: [
            { page: 'profile', label: 'Profile', icon: '👤' },
            { page: 'settings', label: 'Settings', icon: '⚙️' },
            { page: 'preferences', label: 'Preferences', icon: '🎛️' },
            { page: 'session-logs', label: 'Session Logs', icon: '📝' },
            { page: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
        ]
    },
];

const PUBLIC_SECTIONS: NavSection[] = [
    {
        label: 'Product', icon: '🚀', items: [
            { page: 'home', label: 'Home', icon: '🏠' },
            { page: 'pricing', label: 'Pricing', icon: '💰' },
            { page: 'enterprise', label: 'Enterprise', icon: '🏢' },
            { page: 'benchmarks', label: 'Benchmarks', icon: '📊' },
            { page: 'partners', label: 'Partners', icon: '🤝' },
            { page: 'status', label: 'Status', icon: '🟢' },
        ]
    },
    {
        label: 'Developers', icon: '💻', items: [
            { page: 'dev-portal', label: 'Dev Portal', icon: '🛠️' },
            { page: 'docs', label: 'Documentation', icon: '📖' },
            { page: 'quickstart', label: 'Quickstart', icon: '🚀' },
            { page: 'code-samples', label: 'Code Samples', icon: '💻' },
            { page: 'sdk-docs', label: 'SDK Docs', icon: '📦' },
            { page: 'api-versioning', label: 'API Versions', icon: '🔄' },
            { page: 'error-codes', label: 'Error Codes', icon: '❌' },
            { page: 'playground', label: 'Playground', icon: '⚡' },
        ]
    },
    {
        label: 'Resources', icon: '📚', items: [
            { page: 'blog', label: 'Blog', icon: '✍️' },
            { page: 'changelog', label: 'Changelog', icon: '📋' },
            { page: 'release-notes', label: 'Release Notes', icon: '📋' },
            { page: 'roadmap', label: 'Roadmap', icon: '🗺️' },
            { page: 'glossary', label: 'Glossary', icon: '📖' },
            { page: 'faq', label: 'FAQ', icon: '❓' },
            { page: 'help', label: 'Help Center', icon: '🆘' },
        ]
    },
    {
        label: 'Company', icon: '🏢', items: [
            { page: 'about', label: 'About', icon: '💡' },
            { page: 'careers', label: 'Careers', icon: '👔' },
            { page: 'contact', label: 'Contact', icon: '📧' },
            { page: 'open-source', label: 'Open Source', icon: '🌐' },
        ]
    },
];

export default function Sidebar({ currentPage, onNavigate, isLoggedIn }: Props) {
    const sections = isLoggedIn ? AUTH_SECTIONS : PUBLIC_SECTIONS;
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSection = (label: string) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

    if (!sidebarOpen) {
        return (
            <div style={{ width: '48px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>☰</button>
                {sections.map(s => (
                    <div key={s.label} title={s.label} style={{ fontSize: '1rem', padding: '0.4rem', cursor: 'pointer', opacity: s.items.some(i => i.page === currentPage) ? 1 : 0.4 }} onClick={() => { setSidebarOpen(true); }}>{s.icon}</div>
                ))}
            </div>
        );
    }

    return (
        <aside style={{ width: '220px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', overflowY: 'auto', flexShrink: 0, fontSize: '0.8rem', padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.75rem 0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Navigation</span>
                <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>«</button>
            </div>
            {sections.map(section => (
                <div key={section.label} style={{ marginBottom: '0.15rem' }}>
                    <div onClick={() => toggleSection(section.label)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        <span style={{ fontSize: '0.55rem', transition: 'transform 0.2s', transform: collapsed[section.label] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
                        <span>{section.icon}</span>
                        <span>{section.label}</span>
                    </div>
                    {!collapsed[section.label] && section.items.map(item => (
                        <button key={item.page} onClick={() => onNavigate(item.page)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', padding: '0.3rem 0.75rem 0.3rem 1.5rem', border: 'none', background: currentPage === item.page ? 'rgba(0,212,255,0.08)' : 'transparent', color: currentPage === item.page ? '#00d4ff' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left', borderLeft: currentPage === item.page ? '2px solid #00d4ff' : '2px solid transparent', transition: 'all 0.15s' }}>
                            <span style={{ fontSize: '0.75rem' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            ))}
        </aside>
    );
}
