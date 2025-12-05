import type {
  StoredCredential,
  CreateCredentialPayload,
  VerificationResult,
} from '../types/credential';

// Use localhost - WSL2 should forward ports to Windows automatically
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Credentials
  async getCredentials(): Promise<StoredCredential[]> {
    return this.request<StoredCredential[]>('/credentials');
  }

  async getCredential(id: string): Promise<StoredCredential> {
    return this.request<StoredCredential>(`/credentials/${id}`);
  }

  async createCredential(payload: CreateCredentialPayload): Promise<StoredCredential> {
    return this.request<StoredCredential>('/credentials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteCredential(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/credentials/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyCredential(jwt: string): Promise<VerificationResult> {
    return this.request<VerificationResult>('/credentials/verify', {
      method: 'POST',
      body: JSON.stringify({ jwt }),
    });
  }
}

export const api = new ApiService();
