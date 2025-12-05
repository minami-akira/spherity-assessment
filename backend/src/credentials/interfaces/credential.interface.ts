export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id?: string;
    [key: string]: unknown;
  };
}

export interface StoredCredential {
  id: string;
  credential: VerifiableCredential;
  jwt: string;
  createdAt: string;
}

export interface VerificationResult {
  valid: boolean;
  credential?: VerifiableCredential;
  error?: string;
}

