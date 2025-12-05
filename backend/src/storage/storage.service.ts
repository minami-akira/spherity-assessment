import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { StoredCredential } from '../credentials/interfaces/credential.interface';

const DATA_DIR = path.join(process.cwd(), 'data');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'credentials.json');

@Injectable()
export class StorageService implements OnModuleInit {
  private credentials: Map<string, StoredCredential> = new Map();

  async onModuleInit() {
    await this.loadFromFile();
  }

  private async loadFromFile(): Promise<void> {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Load existing credentials if file exists
      if (fs.existsSync(CREDENTIALS_FILE)) {
        const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
        const credentials: StoredCredential[] = JSON.parse(data);
        credentials.forEach((cred) => this.credentials.set(cred.id, cred));
        console.log(`📂 Loaded ${credentials.length} credentials from storage`);
      } else {
        console.log('📂 No existing credentials file, starting fresh');
      }
    } catch (error) {
      console.error('Failed to load credentials from file:', error);
    }
  }

  private saveToFile(): void {
    try {
      const credentials = Array.from(this.credentials.values());
      fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    } catch (error) {
      console.error('Failed to save credentials to file:', error);
    }
  }

  save(credential: StoredCredential): StoredCredential {
    this.credentials.set(credential.id, credential);
    this.saveToFile();
    return credential;
  }

  findAll(): StoredCredential[] {
    return Array.from(this.credentials.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findById(id: string): StoredCredential | undefined {
    return this.credentials.get(id);
  }

  delete(id: string): boolean {
    const result = this.credentials.delete(id);
    if (result) {
      this.saveToFile();
    }
    return result;
  }

  exists(id: string): boolean {
    return this.credentials.has(id);
  }
}
