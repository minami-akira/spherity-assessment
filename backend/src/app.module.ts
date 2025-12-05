import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { StorageModule } from './storage/storage.module';
import { CredentialsModule } from './credentials/credentials.module';

@Module({
  imports: [CryptoModule, StorageModule, CredentialsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
