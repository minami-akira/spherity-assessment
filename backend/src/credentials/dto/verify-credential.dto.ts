import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCredentialDto {
  @ApiProperty({
    description: 'JWT token representing the signed verifiable credential',
    example: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  jwt: string;
}
