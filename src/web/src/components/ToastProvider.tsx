/**
 * Notification Toast System — global in-app notifications
 *
 * Lightweight toast system for success/error/info feedback
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts(prev => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

const TOAST_ICONS: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
};

const TOAST_COLORS: Record<ToastType, string> = {
    success: 'rgba(52,211,153,0.15)',
    error: 'rgba(239,68,68,0.15)',
    info: 'rgba(0,212,255,0.15)',
    warning: 'rgba(251,191,36,0.15)',
};

const TOAST_BORDERS: Record<ToastType, string> = {
    success: 'rgba(52,211,153,0.3)',
    error: 'rgba(239,68,68,0.3)',
    info: 'rgba(0,212,255,0.3)',
    warning: 'rgba(251,191,36,0.3)',
};

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 9999,
            pointerEvents: 'none',
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(onDismiss, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onDismiss]);

    return (
        <div style={{
            background: TOAST_COLORS[toast.type],
            border: `1px solid ${TOAST_BORDERS[toast.type]}`,
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '360px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }} onClick={onDismiss}>
            <span>{TOAST_ICONS[toast.type]}</span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>{toast.message}</span>
        </div>
    );
}
