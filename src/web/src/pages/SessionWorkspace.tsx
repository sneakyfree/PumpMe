/**
 * Session Workspace — Interactive inference chat + terminal for active GPU sessions
 *
 * FEAT-071: Core session interaction UI
 */

import { useState, useRef, useEffect } from 'react';
import './SessionWorkspace.css';

interface Props {
    sessionId: string;
    modelName: string;
    accessUrl?: string;
    onNavigate: (page: string) => void;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

type TabType = 'chat' | 'terminal' | 'metrics';

export default function SessionWorkspace({ sessionId, modelName, accessUrl, onNavigate }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ Connected to GPU session ' + sessionId]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isStreaming) return;
        const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
        const allMessages = [...messages, userMsg];
        setMessages(allMessages);
        setInput('');
        setIsStreaming(true);

        const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date() };
        setMessages([...allMessages, assistantMsg]);

        try {
            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...allMessages.map(m => ({ role: m.role, content: m.content })),
            ];

            const baseUrl = accessUrl || '/v1';
            const res = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelName,
                    messages: apiMessages,
                    stream: true,
                    temperature,
                    max_tokens: maxTokens,
                }),
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        const text = decoder.decode(value, { stream: true });
                        const lines = text.split('\n').filter(l => l.startsWith('data: '));
                        for (const line of lines) {
                            const data = line.slice(6);
                            if (data === '[DONE]') break;
                            try {
                                const parsed = JSON.parse(data);
                                const delta = parsed.choices?.[0]?.delta?.content || '';
                                fullContent += delta;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent };
                                    return updated;
                                });
                            } catch { /* skip */ }
                        }
                    }
                }
            }
        } catch {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: '⚠️ Failed to connect to inference endpoint. Make sure your GPU session is active.',
                };
                return updated;
            });
        }
        setIsStreaming(false);
    };

    const handleTerminalCommand = () => {
        if (!terminalInput.trim()) return;
        setTerminalOutput(prev => [...prev, `$ ${terminalInput}`, '(Terminal forwarding not implemented in demo mode)']);
        setTerminalInput('');
    };

    return (
        <div className="workspace">
            <div className="workspace-header">
                <div className="workspace-title">
                    <span className="status-dot active" />
                    <h2>{modelName}</h2>
                    <span className="session-badge">Session: {sessionId.slice(0, 8)}…</span>
                </div>
                <div className="workspace-tabs">
                    {(['chat', 'terminal', 'metrics'] as TabType[]).map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'chat' ? '💬 Chat' : tab === 'terminal' ? '🖥️ Terminal' : '📊 Metrics'}
                        </button>
                    ))}
                </div>
                <button className="btn btn-sm" style={{ background: '#ff3b30' }} onClick={() => onNavigate('dashboard')}>
                    ■ Stop Session
                </button>
            </div>

            {activeTab === 'chat' && (
                <div className="chat-container">
                    <div className="chat-sidebar">
                        <button className="link-btn" onClick={() => setShowSystemPrompt(!showSystemPrompt)}>
                            {showSystemPrompt ? '▾' : '▸'} System Prompt
                        </button>
                        {showSystemPrompt && (
                            <textarea
                                className="system-prompt"
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                                rows={4}
                            />
                        )}
                        <div className="param-group">
                            <label>Temperature: {temperature.toFixed(1)}</label>
                            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
                        </div>
                        <div className="param-group">
                            <label>Max Tokens: {maxTokens}</label>
                            <input type="range" min="128" max="8192" step="128" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} />
                        </div>
                        <button className="btn btn-sm" onClick={() => setMessages([])}>Clear Chat</button>
                    </div>

                    <div className="chat-main">
                        <div className="messages">
                            {messages.length === 0 && (
                                <div className="empty-chat">
                                    <span style={{ fontSize: '3rem' }}>🚀</span>
                                    <h3>Ready to Pump</h3>
                                    <p>Start chatting with {modelName}</p>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.role}`}>
                                    <div className="message-role">{msg.role === 'user' ? '👤 You' : '🤖 AI'}</div>
                                    <div className="message-content">{msg.content}{isStreaming && i === messages.length - 1 && <span className="cursor">▊</span>}</div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-bar">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder={`Message ${modelName}...`}
                                disabled={isStreaming}
                            />
                            <button className="btn btn-primary" onClick={sendMessage} disabled={isStreaming || !input.trim()}>
                                {isStreaming ? '⏳' : '▶'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'terminal' && (
                <div className="terminal">
                    <div className="terminal-output">
                        {terminalOutput.map((line, i) => (
                            <div key={i} className="terminal-line">{line}</div>
                        ))}
                    </div>
                    <div className="terminal-input">
                        <span className="prompt">$</span>
                        <input
                            type="text"
                            value={terminalInput}
                            onChange={e => setTerminalInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTerminalCommand()}
                            placeholder="Enter command..."
                        />
                    </div>
                </div>
            )}

            {activeTab === 'metrics' && (
                <div className="metrics-panel">
                    <div className="metric-card">
                        <div className="metric-label">GPU Utilization</div>
                        <div className="metric-bar"><div className="metric-fill" style={{ width: '73%', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)' }} /></div>
                        <div className="metric-value">73%</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">VRAM Usage</div>
                        <div className="metric-bar"><div className="metric-fill" style={{ width: '58%', background: 'linear-gradient(90deg, #34d399, #fbbf24)' }} /></div>
                        <div className="metric-value">46.4 / 80 GB</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Temperature</div>
                        <div className="metric-bar"><div className="metric-fill" style={{ width: '45%', background: 'linear-gradient(90deg, #34d399, #ff3b30)' }} /></div>
                        <div className="metric-value">67°C</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Power Draw</div>
                        <div className="metric-bar"><div className="metric-fill" style={{ width: '62%', background: 'linear-gradient(90deg, #fbbf24, #ef4444)' }} /></div>
                        <div className="metric-value">434W / 700W</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Tokens Generated</div>
                        <div className="metric-value" style={{ fontSize: '1.5rem' }}>12,847</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Session Cost</div>
                        <div className="metric-value" style={{ fontSize: '1.5rem', color: '#00d4ff' }}>$4.23</div>
                    </div>
                </div>
            )}
        </div>
    );
}
