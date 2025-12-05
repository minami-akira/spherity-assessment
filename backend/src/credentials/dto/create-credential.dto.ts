import { IsString, IsObject, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCredentialDto {
  @ApiProperty({
    description: 'Type of credential (e.g., GymMembership, EmployeeID, Certificate)',
    example: 'GymMembership',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Claims/attributes for the credential subject',
    example: {
      memberName: 'John Doe',
      membershipType: 'Premium',
      validUntil: '2025-12-31',
    },
  })
  @IsObject()
  @IsNotEmpty()
  claims: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Optional name of the credential holder',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  holderName?: string;
}
