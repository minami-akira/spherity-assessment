import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    // Initialize keys
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getIssuerDid', () => {
    it('should return a DID', () => {
      const did = service.getIssuerDid();
      expect(did).toBeDefined();
      expect(did.startsWith('did:key:')).toBe(true);
    });
  });

  describe('signCredential', () => {
    it('should sign a credential and return a JWT', async () => {
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'urn:uuid:test',
        type: ['VerifiableCredential'],
        issuer: 'did:key:test',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:example:holder',
          name: 'Test',
        },
      };

      const jwt = await service.signCredential(credential);

      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      // JWT should have 3 parts separated by dots
      expect(jwt.split('.').length).toBe(3);
    });
  });

  describe('verifyCredential', () => {
    it('should verify a valid JWT', async () => {
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'urn:uuid:test',
        type: ['VerifiableCredential'],
        issuer: service.getIssuerDid(),
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:example:holder',
          name: 'Test User',
        },
      };

      // Sign the credential
      const jwt = await service.signCredential(credential);

      // Verify the same credential
      const result = await service.verifyCredential(jwt);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
    });

    it('should reject an invalid JWT', async () => {
      const result = await service.verifyCredential('invalid.jwt.token');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject a tampered JWT', async () => {
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'urn:uuid:test',
        type: ['VerifiableCredential'],
        issuer: service.getIssuerDid(),
        issuanceDate: new Date().toISOString(),
        credentialSubject: { name: 'Test' },
      };

      const jwt = await service.signCredential(credential);
      // Tamper with the JWT
      const tamperedJwt = jwt.slice(0, -5) + 'xxxxx';

      const result = await service.verifyCredential(tamperedJwt);

      expect(result.valid).toBe(false);
    });
  });
});

