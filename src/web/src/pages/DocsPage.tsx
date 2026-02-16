/**
 * API Documentation Page — interactive endpoint reference
 */

import './DocsPage.css';

interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    auth: boolean;
    body?: string;
    response?: string;
}

const ENDPOINTS: Record<string, Endpoint[]> = {
    'Authentication': [
        { method: 'POST', path: '/api/auth/register', description: 'Create a new account', auth: false, body: '{ email, password, name }', response: '{ user, token }' },
        { method: 'POST', path: '/api/auth/login', description: 'Sign in with credentials', auth: false, body: '{ email, password }', response: '{ user, token }' },
        { method: 'POST', path: '/api/auth/logout', description: 'Sign out and invalidate token', auth: true },
        { method: 'GET', path: '/api/auth/me', description: 'Get current user profile', auth: true, response: '{ user }' },
        { method: 'PUT', path: '/api/auth/profile', description: 'Update user profile', auth: true, body: '{ name, email }' },
        { method: 'PUT', path: '/api/auth/password', description: 'Change password', auth: true, body: '{ currentPassword, newPassword }' },
    ],
    'Sessions': [
        { method: 'GET', path: '/api/sessions', description: 'List user sessions', auth: true, response: '{ data: Session[] }' },
        { method: 'POST', path: '/api/sessions', description: 'Create a new GPU session', auth: true, body: '{ tier, gpuType, modelId, type }', response: '{ session }' },
        { method: 'GET', path: '/api/sessions/:id', description: 'Get session details', auth: true, response: '{ session }' },
        { method: 'POST', path: '/api/sessions/:id/terminate', description: 'Terminate a session', auth: true },
        { method: 'GET', path: '/api/sessions/:id/metrics', description: 'Get session GPU metrics', auth: true, response: '{ metrics }' },
        { method: 'GET', path: '/api/sessions/:id/stream', description: 'SSE stream for real-time updates', auth: true, response: 'text/event-stream' },
    ],
    'Billing': [
        { method: 'GET', path: '/api/billing/balance', description: 'Get credit balance', auth: true, response: '{ balance, currency }' },
        { method: 'GET', path: '/api/billing/transactions', description: 'Get transaction history', auth: true, response: '{ transactions }' },
        { method: 'GET', path: '/api/billing/invoices', description: 'Get invoices', auth: true, response: '{ invoices }' },
    ],
    'Payments': [
        { method: 'POST', path: '/api/payments/checkout', description: 'Create Stripe checkout session', auth: true, body: '{ amount, packageId }', response: '{ checkoutUrl }' },
        { method: 'POST', path: '/api/payments/webhook', description: 'Stripe webhook handler', auth: false },
    ],
    'Models': [
        { method: 'GET', path: '/api/models', description: 'List available AI models', auth: false, response: '{ models }' },
        { method: 'GET', path: '/api/models/:slug', description: 'Get model details', auth: false, response: '{ model }' },
        { method: 'GET', path: '/api/models/categories', description: 'Get model categories', auth: false, response: '{ categories }' },
    ],
    'API Keys': [
        { method: 'GET', path: '/api/keys', description: 'List your API keys', auth: true, response: '{ keys }' },
        { method: 'POST', path: '/api/keys', description: 'Create a new API key', auth: true, body: '{ name, expiresInDays? }', response: '{ key, rawKey }' },
        { method: 'DELETE', path: '/api/keys/:keyId', description: 'Revoke an API key', auth: true },
    ],
    'Health & Metrics': [
        { method: 'GET', path: '/api/health', description: 'Health check', auth: false, response: '{ status, uptime }' },
        { method: 'GET', path: '/metrics', description: 'Prometheus metrics', auth: false, response: 'text/plain' },
    ],
};

const METHOD_COLORS: Record<string, string> = {
    GET: '#34c759',
    POST: '#007aff',
    PUT: '#ff9500',
    DELETE: '#ff3b30',
};

interface Props {
    onNavigate: (page: string) => void;
}

export default function DocsPage({ onNavigate }: Props) {
    return (
        <div className="docs-page">
            <button className="link-btn" onClick={() => onNavigate('dashboard')}>← Dashboard</button>
            <h1>API Reference</h1>
            <p className="docs-subtitle">
                Authenticate with <code>Authorization: Bearer pm_live_xxx</code> or session cookie.
                All responses use the envelope format: <code>{'{ success, data?, error? }'}</code>
            </p>

            <div className="docs-base-url">
                <span className="base-label">Base URL</span>
                <code>https://api.pumpme.cloud</code>
            </div>

            {Object.entries(ENDPOINTS).map(([group, endpoints]) => (
                <div key={group} className="docs-group">
                    <h2>{group}</h2>
                    <div className="endpoints">
                        {endpoints.map((ep, i) => (
                            <div key={i} className="endpoint">
                                <div className="ep-header">
                                    <span className="ep-method" style={{ color: METHOD_COLORS[ep.method] }}>{ep.method}</span>
                                    <code className="ep-path">{ep.path}</code>
                                    {ep.auth && <span className="ep-auth">🔒</span>}
                                </div>
                                <p className="ep-desc">{ep.description}</p>
                                {ep.body && (
                                    <div className="ep-detail">
                                        <span className="ep-detail-label">Body:</span>
                                        <code>{ep.body}</code>
                                    </div>
                                )}
                                {ep.response && (
                                    <div className="ep-detail">
                                        <span className="ep-detail-label">Response:</span>
                                        <code>{ep.response}</code>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Rate Limits */}
            <div className="docs-group">
                <h2>Rate Limits</h2>
                <div className="rate-limits">
                    <div className="rate-row"><span>Auth endpoints</span><span>10 requests / 15 min</span></div>
                    <div className="rate-row"><span>API endpoints</span><span>100 requests / min</span></div>
                    <div className="rate-row"><span>Strict endpoints</span><span>5 requests / hr</span></div>
                </div>
                <p className="rate-note">Rate limit info returned in <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code> headers.</p>
            </div>
        </div>
    );
}
