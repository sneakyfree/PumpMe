// Error Codes Reference Page

interface Props { onNavigate: (page: string) => void; }

interface ErrorCode { code: number; name: string; desc: string; resolution: string; category: string; }

const ERRORS: ErrorCode[] = [
    { code: 400, name: 'Bad Request', desc: 'Invalid request body, missing required fields, or malformed JSON.', resolution: 'Check your request payload matches the API schema.', category: 'Client' },
    { code: 401, name: 'Unauthorized', desc: 'Missing or invalid API key in the Authorization header.', resolution: 'Ensure you\'re using a valid key: Authorization: Bearer pm-...', category: 'Client' },
    { code: 403, name: 'Forbidden', desc: 'API key lacks permission for this resource or action.', resolution: 'Check key scopes in Settings → API Keys.', category: 'Client' },
    { code: 404, name: 'Not Found', desc: 'The requested resource (model, session, etc.) does not exist.', resolution: 'Verify the resource ID and that it belongs to your account.', category: 'Client' },
    { code: 409, name: 'Conflict', desc: 'Resource already exists or conflicting operation in progress.', resolution: 'Wait for the current operation or use a different identifier.', category: 'Client' },
    { code: 422, name: 'Validation Error', desc: 'Request parameters fail validation (e.g., temperature out of range).', resolution: 'Review error details for specific field-level issues.', category: 'Client' },
    { code: 429, name: 'Rate Limited', desc: 'Too many requests. You\'ve exceeded your tier\'s rate limit.', resolution: 'Implement exponential backoff. Check Retry-After header.', category: 'Client' },
    { code: 500, name: 'Internal Error', desc: 'Unexpected server error. Our team is automatically notified.', resolution: 'Retry with backoff. If persistent, contact support.', category: 'Server' },
    { code: 502, name: 'Bad Gateway', desc: 'GPU provider communication failure during inference.', resolution: 'Request will auto-retry. Check status.pumpme.io for outages.', category: 'Server' },
    { code: 503, name: 'Service Unavailable', desc: 'All GPU capacity is currently in use for the requested model.', resolution: 'Try a different GPU type or model, or wait and retry.', category: 'Server' },
    { code: 504, name: 'Gateway Timeout', desc: 'Inference timed out (>120s for non-streaming requests).', resolution: 'Use streaming mode for long generations. Reduce max_tokens.', category: 'Server' },
];

export default function ErrorCodesPage({ onNavigate }: Props) {
    return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <button className="link-btn" onClick={() => onNavigate('docs')}>← Docs</button>
            <h1 style={{ margin: '1rem 0' }}>⚠️ Error Codes Reference</h1>

            {['Client', 'Server'].map(cat => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: cat === 'Client' ? '#f59e0b' : '#ef4444', marginBottom: '0.5rem' }}>
                        {cat === 'Client' ? '4xx Client Errors' : '5xx Server Errors'}
                    </div>
                    {ERRORS.filter(e => e.category === cat).map(err => (
                        <div key={err.code} style={{ padding: '0.65rem 1rem', marginBottom: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                                <code style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: cat === 'Client' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: cat === 'Client' ? '#f59e0b' : '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>{err.code}</code>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{err.name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.2rem' }}>{err.desc}</div>
                            <div style={{ fontSize: '0.72rem', color: '#34d399' }}>💡 {err.resolution}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
