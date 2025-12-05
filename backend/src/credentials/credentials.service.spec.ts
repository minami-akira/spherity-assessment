import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CryptoService } from '../crypto/crypto.service';
import { StorageService } from '../storage/storage.service';

describe('CredentialsService', () => {
  let service: CredentialsService;
  let cryptoService: CryptoService;
  let storageService: StorageService;

  const mockCryptoService = {
    getIssuerDid: jest.fn().mockReturnValue('did:key:test123'),
    signCredential: jest.fn().mockResolvedValue('mock.jwt.token'),
    verifyCredential: jest.fn(),
  };

  const mockStorageService = {
    save: jest.fn((cred) => cred),
    findAll: jest.fn().mockReturnValue([]),
    findById: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
    cryptoService = module.get<CryptoService>(CryptoService);
    storageService = module.get<StorageService>(StorageService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new credential', async () => {
      const dto = {
        type: 'GymMembership',
        claims: { memberName: 'John Doe' },
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.jwt).toBe('mock.jwt.token');
      expect(result.credential.type).toContain('VerifiableCredential');
      expect(result.credential.type).toContain('GymMembershipCredential');
      expect(mockCryptoService.signCredential).toHaveBeenCalled();
      expect(mockStorageService.save).toHaveBeenCalled();
    });

    it('should include claims in credential subject', async () => {
      const dto = {
        type: 'Certificate',
        claims: { courseName: 'TypeScript', grade: 'A' },
      };

      const result = await service.create(dto);

      expect(result.credential.credentialSubject.courseName).toBe('TypeScript');
      expect(result.credential.credentialSubject.grade).toBe('A');
    });
  });

  describe('findAll', () => {
    it('should return all credentials', () => {
      const mockCredentials = [
        { id: '1', jwt: 'jwt1', credential: {}, createdAt: new Date().toISOString() },
        { id: '2', jwt: 'jwt2', credential: {}, createdAt: new Date().toISOString() },
      ];
      mockStorageService.findAll.mockReturnValue(mockCredentials);

      const result = service.findAll();

      expect(result).toEqual(mockCredentials);
      expect(mockStorageService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a credential by id', () => {
      const mockCredential = { id: '1', jwt: 'jwt1', credential: {}, createdAt: new Date().toISOString() };
      mockStorageService.findById.mockReturnValue(mockCredential);

      const result = service.findOne('1');

      expect(result).toEqual(mockCredential);
    });

    it('should throw NotFoundException if credential not found', () => {
      mockStorageService.findById.mockReturnValue(undefined);

      expect(() => service.findOne('nonexistent')).toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a credential', () => {
      mockStorageService.exists.mockReturnValue(true);
      mockStorageService.delete.mockReturnValue(true);

      const result = service.delete('1');

      expect(result.message).toBe('Credential deleted successfully');
    });

    it('should throw NotFoundException if credential not found', () => {
      mockStorageService.exists.mockReturnValue(false);

      expect(() => service.delete('nonexistent')).toThrow(NotFoundException);
    });
  });

  describe('verify', () => {
    it('should verify a valid credential', async () => {
      const mockPayload = {
        type: ['VerifiableCredential'],
        issuer: 'did:key:test',
      };
      mockCryptoService.verifyCredential.mockResolvedValue({
        valid: true,
        payload: mockPayload,
      });

      const result = await service.verify('valid.jwt.token');

      expect(result.valid).toBe(true);
      expect(result.credential).toEqual(mockPayload);
    });

    it('should return invalid for bad signature', async () => {
      mockCryptoService.verifyCredential.mockResolvedValue({
        valid: false,
        error: 'Invalid signature',
      });

      const result = await service.verify('invalid.jwt.token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });
});

