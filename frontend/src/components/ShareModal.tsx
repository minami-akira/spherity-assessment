import { useState } from 'react';
import type { StoredCredential } from '../types/credential';

interface ShareModalProps {
  credential: StoredCredential;
  onClose: () => void;
}

export function ShareModal({ credential, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState<'jwt' | 'json' | 'link' | null>(null);

  const copyToClipboard = async (text: string, type: 'jwt' | 'json' | 'link') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const jsonData = JSON.stringify(credential.credential, null, 2);
  const shareLink = `${window.location.origin}?verify=${encodeURIComponent(credential.jwt)}`;

  const CopyButton = ({ type, text }: { type: 'jwt' | 'json' | 'link'; text: string }) => (
    <button
      onClick={() => copyToClipboard(text, type)}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        copied === type
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent'
      }`}
    >
      {copied === type ? '✓ Copied!' : '📋 Copy'}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <span className="text-3xl">🔗</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-100">Share Credential</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose how you want to share this credential
        </p>
      </div>

      {/* JWT Option */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>🔏</span>
            JWT Token
          </h3>
          <CopyButton type="jwt" text={credential.jwt} />
        </div>
        <div className="p-4">
          <div className="bg-slate-950 rounded-lg p-3 max-h-20 overflow-y-auto">
            <code className="text-xs text-slate-400 break-all font-mono">{credential.jwt}</code>
          </div>
        </div>
      </div>

      {/* JSON Option */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>📄</span>
            JSON Format
          </h3>
          <CopyButton type="json" text={jsonData} />
        </div>
        <div className="p-4">
          <div className="bg-slate-950 rounded-lg p-3 max-h-32 overflow-y-auto">
            <pre className="text-xs text-slate-400 font-mono">{jsonData}</pre>
          </div>
        </div>
      </div>

      {/* Shareable Link */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>🌐</span>
            Shareable Link
          </h3>
          <CopyButton type="link" text={shareLink} />
        </div>
        <div className="p-4">
          <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
            <code className="text-xs text-primary-400 break-all font-mono">{shareLink}</code>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Anyone with this link can verify the credential
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button onClick={onClose} className="btn-secondary w-full flex items-center justify-center gap-2">
        <span>←</span>
        Close
      </button>
    </div>
  );
}
