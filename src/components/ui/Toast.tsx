'use client';

import { useEffect } from 'react';
import { Icons } from '@/lib/icons';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div className={`fixed bottom-24 lg:bottom-6 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-lg animate-in slide-in-from-bottom-5 ${styles[type]}`}>
            <span className="font-headline font-medium text-sm">{message}</span>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <Icons.Close className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const { toasts, removeToast } = require('@/stores/toastStore').useToastStore();

    return (
        <>
            {toasts.map((toast: any) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
}
