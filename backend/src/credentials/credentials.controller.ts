import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto, VerifyCredentialDto } from './dto';
import type { StoredCredential, VerificationResult } from './interfaces/credential.interface';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue a new verifiable credential' })
  @ApiResponse({
    status: 201,
    description: 'Credential successfully issued and signed',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createCredentialDto: CreateCredentialDto): Promise<StoredCredential> {
    return this.credentialsService.create(createCredentialDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all credentials in the wallet' })
  @ApiResponse({
    status: 200,
    description: 'List of all stored credentials',
  })
  findAll(): StoredCredential[] {
    return this.credentialsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific credential by ID' })
  @ApiParam({ name: 'id', description: 'Credential UUID' })
  @ApiResponse({ status: 200, description: 'The credential details' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  findOne(@Param('id') id: string): StoredCredential {
    return this.credentialsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a credential from the wallet' })
  @ApiParam({ name: 'id', description: 'Credential UUID' })
  @ApiResponse({ status: 200, description: 'Credential deleted successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  delete(@Param('id') id: string): { message: string } {
    return this.credentialsService.delete(id);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a credential JWT signature' })
  @ApiResponse({
    status: 200,
    description: 'Verification result with credential details if valid',
  })
  async verify(@Body() verifyCredentialDto: VerifyCredentialDto): Promise<VerificationResult> {
    return this.credentialsService.verify(verifyCredentialDto.jwt);
  }
}
