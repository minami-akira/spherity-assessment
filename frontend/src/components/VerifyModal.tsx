import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { VerificationResult } from '../types/credential';

interface VerifyModalProps {
  initialJwt?: string;
  onClose: () => void;
}

export function VerifyModal({ initialJwt, onClose }: VerifyModalProps) {
  const [jwt, setJwt] = useState(initialJwt || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialJwt) {
      handleVerify(initialJwt);
    }
  }, [initialJwt]);

  const handleVerify = async (tokenToVerify?: string) => {
    const token = tokenToVerify || jwt;
    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const verificationResult = await api.verifyCredential(token.trim());
      setResult(verificationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJwt('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-100">Verify Credential</h2>
        <p className="text-sm text-slate-500 mt-1">
          Paste a JWT token to verify its authenticity
        </p>
      </div>

      {/* JWT Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <span>🔏</span>
          JWT Token
        </label>
        <textarea
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          placeholder="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
          className="textarea w-full h-32"
          disabled={isLoading}
        />
        {jwt && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-slate-300 mt-2 transition-colors"
          >
            Clear input
          </button>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={() => handleVerify()}
        disabled={isLoading || !jwt.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <span>✓</span>
            Verify Credential
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <span className="text-xl">❌</span>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl border overflow-hidden ${
            result.valid
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : 'bg-red-500/5 border-red-500/30'
          }`}
        >
          {/* Result Header */}
          <div className={`px-4 py-3 flex items-center gap-3 ${
            result.valid ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}>
            <span className="text-2xl">{result.valid ? '✅' : '❌'}</span>
            <span className={`font-semibold ${
              result.valid ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {result.valid ? 'Valid Credential' : 'Invalid Credential'}
            </span>
          </div>

          {/* Result Details */}
          <div className="p-4">
            {result.valid && result.credential && (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-500 text-sm">Type</span>
                  <span className="text-slate-300 text-sm">
                    {result.credential.type.filter(t => t !== 'VerifiableCredential').join(', ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-500 text-sm">Issuer</span>
                  <span className="text-slate-300 font-mono text-xs bg-slate-800 px-2 py-1 rounded truncate max-w-[200px]">
                    {result.credential.issuer}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-500 text-sm">Issued</span>
                  <span className="text-slate-300 text-sm">
                    {new Date(result.credential.issuanceDate).toLocaleString()}
                  </span>
                </div>
                
                {/* Subject Claims */}
                <div className="pt-2">
                  <span className="text-slate-500 text-sm flex items-center gap-2 mb-2">
                    <span>📋</span>
                    Subject Claims
                  </span>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <pre className="text-xs text-slate-400 font-mono overflow-x-auto">
                      {JSON.stringify(result.credential.credentialSubject, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!result.valid && result.error && (
              <p className="text-sm text-red-400">{result.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Close Button */}
      <button onClick={onClose} className="btn-secondary w-full flex items-center justify-center gap-2">
        <span>←</span>
        Close
      </button>
    </div>
  );
}
