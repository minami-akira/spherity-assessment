import { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import type { StoredCredential, CreateCredentialPayload } from './types/credential';
import {
  CredentialCard,
  CredentialForm,
  CredentialDetail,
  ShareModal,
  VerifyModal,
  Modal,
  ConfirmModal,
} from './components';

type ModalType = 'create' | 'view' | 'share' | 'verify' | null;

function App() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<StoredCredential | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyJwt, setVerifyJwt] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<StoredCredential | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    let valid = 0;
    let expired = 0;

    credentials.forEach((cred) => {
      const validUntil = cred.credential.credentialSubject.validUntil as string | undefined;
      if (validUntil && new Date(validUntil) < now) {
        expired++;
      } else {
        valid++;
      }
    });

    return { total: credentials.length, valid, expired };
  }, [credentials]);

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
    
    // Check for verify parameter in URL
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      setVerifyJwt(verifyParam);
      setModalType('verify');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCredentials();
      setCredentials(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (payload: CreateCredentialPayload) => {
    const newCredential = await api.createCredential(payload);
    setCredentials((prev) => [newCredential, ...prev]);
    setModalType(null);
  };

  const handleDeleteRequest = (credential: StoredCredential) => {
    setDeleteTarget(credential);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await api.deleteCredential(deleteTarget.id);
      setCredentials((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setModalType(null);
      setSelectedCredential(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credential');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const openModal = (type: ModalType, credential?: StoredCredential) => {
    setSelectedCredential(credential || null);
    setModalType(type);
    if (type !== 'verify') {
      setVerifyJwt(undefined);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCredential(null);
    setVerifyJwt(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl shadow-lg shadow-primary-500/25">
                🔐
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">VC Wallet</h1>
                <p className="text-xs text-slate-500">Verifiable Credential Wallet</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openModal('verify')}
                className="btn-secondary flex items-center gap-2"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Verify</span>
              </button>
              <button
                onClick={() => openModal('create')}
                className="btn-primary flex items-center gap-2"
              >
                <span>✨</span>
                <span>Issue Credential</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadCredentials();
              }}
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
            <div className="text-sm text-slate-500">Total</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.valid}</div>
            <div className="text-sm text-slate-500">Valid</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-1">⏰</div>
            <div className="text-2xl font-bold text-amber-400">{stats.expired}</div>
            <div className="text-sm text-slate-500">Expired</div>
          </div>
        </div>

        {/* Credentials Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <span>🎫</span>
            Your Credentials
          </h2>
          <button
            onClick={loadCredentials}
            disabled={isLoading}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <span className={isLoading ? 'animate-spin' : ''}>↻</span>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Loading credentials...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-16 card">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No credentials yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Issue your first verifiable credential to get started. Choose from templates like Gym Membership, Employee ID, or Certificate.
            </p>
            <button onClick={() => openModal('create')} className="btn-primary">
              ✨ Issue Your First Credential
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onView={(c) => openModal('view', c)}
                onShare={(c) => openModal('share', c)}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>Mini Verifiable Credential Wallet</p>
          <p className="text-xs mt-1">Built with NestJS & React • W3C VC Compatible</p>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={modalType === 'create'} onClose={closeModal}>
        <CredentialForm
          onSubmit={handleCreate}
          onCancel={closeModal}
        />
      </Modal>

      <Modal isOpen={modalType === 'view'} onClose={closeModal} size="lg">
        {selectedCredential && (
          <CredentialDetail
            credential={selectedCredential}
            onClose={closeModal}
            onShare={() => setModalType('share')}
            onDelete={() => handleDeleteRequest(selectedCredential)}
          />
        )}
      </Modal>

      <Modal isOpen={modalType === 'share'} onClose={closeModal}>
        {selectedCredential && (
          <ShareModal credential={selectedCredential} onClose={closeModal} />
        )}
      </Modal>

      <Modal isOpen={modalType === 'verify'} onClose={closeModal} size="lg">
        <VerifyModal initialJwt={verifyJwt} onClose={closeModal} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Credential"
        message="Are you sure you want to delete this credential? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default App;
