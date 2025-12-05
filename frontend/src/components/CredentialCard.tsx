import type { StoredCredential } from '../types/credential';

interface CredentialCardProps {
  credential: StoredCredential;
  onView: (credential: StoredCredential) => void;
  onShare: (credential: StoredCredential) => void;
  onDelete: (credential: StoredCredential) => void;
}

export function CredentialCard({
  credential,
  onView,
  onShare,
  onDelete,
}: CredentialCardProps) {
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
    
    // Check if it's a date field
    const dateFields = ['validUntil', 'startDate', 'completionDate', 'expiryDate'];
    if (dateFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      try {
        return new Date(strValue).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
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

  // Get subject display info
  const subjectEntries = Object.entries(vc.credentialSubject).filter(
    ([key]) => key !== 'id'
  );

  const expired = isExpired();

  return (
    <div className={`card group transition-all duration-300 hover:shadow-lg ${
      expired 
        ? 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/10' 
        : 'hover:border-primary-500/50 hover:shadow-primary-500/10'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            expired ? 'bg-amber-500/10' : 'bg-primary-500/10'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100">{displayType}</h3>
            <p className="text-xs text-slate-500 font-mono">
              ID: {credential.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className={`px-2.5 py-1 text-xs rounded-full border ${
          expired 
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        }`}>
          {expired ? '⚠️ Expired' : '✓ Valid'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {subjectEntries.slice(0, 3).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm gap-2">
            <span className="text-slate-500 capitalize shrink-0">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-slate-300 text-right truncate">
              {formatValue(key, value)}
            </span>
          </div>
        ))}
        {subjectEntries.length > 3 && (
          <p className="text-xs text-slate-600">
            +{subjectEntries.length - 3} more fields
          </p>
        )}
      </div>

      <div className="text-xs text-slate-600 mb-4 flex items-center gap-1">
        <span>📅</span>
        <span>Issued: {new Date(vc.issuanceDate).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-800">
        <button
          onClick={() => onView(credential)}
          className="btn-secondary flex-1 text-sm py-1.5"
        >
          👁️ View
        </button>
        <button
          onClick={() => onShare(credential)}
          className="btn-secondary flex-1 text-sm py-1.5"
        >
          🔗 Share
        </button>
        <button
          onClick={() => onDelete(credential)}
          className="btn-danger text-sm py-1.5 px-3"
          title="Delete credential"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
