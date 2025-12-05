import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CryptoService } from '../crypto/crypto.service';
import { StorageService } from '../storage/storage.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import {
  StoredCredential,
  VerifiableCredential,
  VerificationResult,
} from './interfaces/credential.interface';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly storageService: StorageService,
  ) {}

  async create(createCredentialDto: CreateCredentialDto): Promise<StoredCredential> {
    const credentialId = `urn:uuid:${uuidv4()}`;
    const now = new Date().toISOString();

    // Build W3C Verifiable Credential structure
    const credential: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: credentialId,
      type: ['VerifiableCredential', `${createCredentialDto.type}Credential`],
      issuer: this.cryptoService.getIssuerDid(),
      issuanceDate: now,
      credentialSubject: {
        id: `did:example:${uuidv4().slice(0, 8)}`,
        ...createCredentialDto.claims,
      },
    };

    // Sign the credential
    const jwt = await this.cryptoService.signCredential(credential);

    // Store the credential
    const storedCredential: StoredCredential = {
      id: uuidv4(),
      credential,
      jwt,
      createdAt: now,
    };

    return this.storageService.save(storedCredential);
  }

  findAll(): StoredCredential[] {
    return this.storageService.findAll();
  }

  findOne(id: string): StoredCredential {
    const credential = this.storageService.findById(id);
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
    return credential;
  }

  delete(id: string): { message: string } {
    if (!this.storageService.exists(id)) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
    this.storageService.delete(id);
    return { message: 'Credential deleted successfully' };
  }

  async verify(jwt: string): Promise<VerificationResult> {
    const result = await this.cryptoService.verifyCredential(jwt);
    return {
      valid: result.valid,
      credential: result.payload,
      error: result.error,
    };
  }
}

