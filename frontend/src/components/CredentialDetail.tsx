import type { StoredCredential } from '../types/credential';

interface CredentialDetailProps {
  credential: StoredCredential;
  onClose: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function CredentialDetail({
  credential,
  onClose,
  onShare,
  onDelete,
}: CredentialDetailProps) {
  const { credential: vc } = credential;
  const credentialType = vc.type.find((t) => t !== 'VerifiableCredential') || 'Credential';
  const displayType = credentialType.replace('Credential', '');

  // Get icon based on type
  const getIcon = () => {
    if (displayType.includes('Gym')) return '🏋️';
    if (displayType.includes('Employee')) return '💼';
    if (displayType.includes('Certificate')) return '📜';
    return '🎫';
  };

  // Format value for display
  const formatValue = (key: string, value: unknown): string => {
    const strValue = String(value);
    const dateFields = ['validUntil', 'startDate', 'completionDate', 'expiryDate', 'issuanceDate'];
    
    if (dateFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      try {
        return new Date(strValue).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return strValue;
      }
    }
    return strValue;
  };

  // Check if credential is expired
  const isExpired = () => {
    const validUntil = vc.credentialSubject.validUntil as string | undefined;
    if (validUntil) {
      return new Date(validUntil) < new Date();
    }
    return false;
  };

  const expired = isExpired();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
          expired ? 'bg-amber-500/10' : 'bg-primary-500/10'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-100">{displayType}</h2>
          <p className="text-sm text-slate-500 font-mono mt-1">ID: {credential.id}</p>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-sm rounded-full border ${
            expired 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {expired ? '⚠️ Expired' : '✅ Valid'}
          </div>
        </div>
      </div>

      {/* Credential Subject */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>📋</span>
            Credential Details
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {Object.entries(vc.credentialSubject)
            .filter(([key]) => key !== 'id')
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                <span className="text-slate-500 capitalize text-sm">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-slate-200 font-medium">{formatValue(key, value)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>ℹ️</span>
            Metadata
          </h3>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
            <span className="text-slate-500">Issuer DID</span>
            <span className="text-slate-300 font-mono text-xs bg-slate-800 px-2 py-1 rounded truncate max-w-[200px]">
              {vc.issuer}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
            <span className="text-slate-500">Issuance Date</span>
            <span className="text-slate-300">
              {new Date(vc.issuanceDate).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500">Credential ID</span>
            <span className="text-slate-300 font-mono text-xs bg-slate-800 px-2 py-1 rounded truncate max-w-[200px]">
              {vc.id}
            </span>
          </div>
        </div>
      </div>

      {/* JWT Proof */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span>🔏</span>
            JWT Proof
          </h3>
        </div>
        <div className="p-4">
          <div className="bg-slate-950 rounded-lg p-3 max-h-24 overflow-y-auto">
            <code className="text-xs text-slate-400 break-all font-mono">{credential.jwt}</code>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <span>←</span>
          Close
        </button>
        <button onClick={onShare} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <span>🔗</span>
          Share
        </button>
        <button 
          onClick={onDelete} 
          className="btn-danger flex items-center justify-center gap-2 px-4"
          title="Delete credential"
        >
          <span>🗑️</span>
        </button>
      </div>
    </div>
  );
}
