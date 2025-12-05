import { Injectable, OnModuleInit } from '@nestjs/common';
import * as jose from 'jose';
import type { VerifiableCredential } from '../credentials/interfaces/credential.interface';

@Injectable()
export class CryptoService implements OnModuleInit {
  private privateKey: CryptoKey;
  private publicKey: CryptoKey;
  private issuerDid: string;

  async onModuleInit() {
    await this.initializeKeys();
  }

  private async initializeKeys(): Promise<void> {
    // Generate Ed25519 key pair for signing
    const { publicKey, privateKey } = await jose.generateKeyPair('EdDSA', {
      crv: 'Ed25519',
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;

    // Create a DID from the public key (simplified did:key method)
    const publicJwk = await jose.exportJWK(publicKey);
    const thumbprint = await jose.calculateJwkThumbprint(publicJwk, 'sha256');
    this.issuerDid = `did:key:${thumbprint}`;

    console.log('Crypto service initialized with issuer DID:', this.issuerDid);
  }

  getIssuerDid(): string {
    return this.issuerDid;
  }

  async signCredential(credential: VerifiableCredential): Promise<string> {
    const jwt = await new jose.SignJWT({ vc: credential })
      .setProtectedHeader({ alg: 'EdDSA', typ: 'JWT' })
      .setIssuedAt()
      .setIssuer(this.issuerDid)
      .setSubject(credential.credentialSubject.id || 'anonymous')
      .sign(this.privateKey);

    return jwt;
  }

  async verifyCredential(jwt: string): Promise<{
    valid: boolean;
    payload?: VerifiableCredential;
    error?: string;
  }> {
    try {
      const { payload } = await jose.jwtVerify(jwt, this.publicKey, {
        issuer: this.issuerDid,
      });

      return {
        valid: true,
        payload: payload.vc as VerifiableCredential,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown verification error',
      };
    }
  }
}

