import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { SystemConfigService, SystemConfiguration } from './system-config.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles, Role } from '../../common/decorators/roles.decorator';

// DTOs for provider configuration
class UpdateAIConfigDto {
  @ApiProperty({ description: 'AI provider (gemini, openai, anthropic)' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'API Key for the AI provider' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'AI model name', required: false })
  @IsString()
  @IsOptional()
  model?: string;
}

class UpdateDatabaseConfigDto {
  @ApiProperty({ description: 'Database provider (firebase, mongodb, dynamodb, supabase)' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'MongoDB URI or Supabase URL', required: false })
  @IsString()
  @IsOptional()
  uri?: string;

  @ApiProperty({ description: 'Firebase Project ID', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'AWS Region for DynamoDB', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ description: 'Supabase API Key', required: false })
  @IsString()
  @IsOptional()
  apiKey?: string;
}

class UpdatePaymentConfigDto {
  @ApiProperty({ description: 'Payment provider (stripe, paypal, square)' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Publishable/Public Key' })
  @IsString()
  publishableKey: string;

  @ApiProperty({ description: 'Secret Key' })
  @IsString()
  secretKey: string;

  @ApiProperty({ description: 'Test mode enabled', required: false })
  @IsBoolean()
  @IsOptional()
  testMode?: boolean;
}

class UpdateStorageConfigDto {
  @ApiProperty({ description: 'Storage provider (firebase-storage, s3, cloudinary, local)' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Bucket name or cloud name', required: false })
  @IsString()
  @IsOptional()
  bucket?: string;

  @ApiProperty({ description: 'Access key or API key', required: false })
  @IsString()
  @IsOptional()
  accessKey?: string;

  @ApiProperty({ description: 'Secret key or API secret', required: false })
  @IsString()
  @IsOptional()
  secretKey?: string;

  @ApiProperty({ description: 'Region (for S3)', required: false })
  @IsString()
  @IsOptional()
  region?: string;
}

class TestDatabaseConnectionDto {
  @ApiProperty({ description: 'Database provider type' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'MongoDB connection URI', required: false })
  @IsString()
  @IsOptional()
  uri?: string;

  @ApiProperty({ description: 'Firebase Project ID', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'API Key', required: false })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiProperty({ description: 'AWS Region', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ description: 'AWS Access Key ID', required: false })
  @IsString()
  @IsOptional()
  accessKeyId?: string;

  @ApiProperty({ description: 'AWS Secret Access Key', required: false })
  @IsString()
  @IsOptional()
  secretAccessKey?: string;

  @ApiProperty({ description: 'Supabase URL', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Supabase Anon Key', required: false })
  @IsString()
  @IsOptional()
  anonKey?: string;
}

class TestAIConnectionDto {
  @ApiProperty({ description: 'AI provider type' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'API Key for the AI provider' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'Model name', required: false })
  @IsString()
  @IsOptional()
  model?: string;
}

class TestPaymentConnectionDto {
  @ApiProperty({ description: 'Payment provider type' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Publishable/Public Key', required: false })
  @IsString()
  @IsOptional()
  publishableKey?: string;

  @ApiProperty({ description: 'Secret Key', required: false })
  @IsString()
  @IsOptional()
  secretKey?: string;

  @ApiProperty({ description: 'PayPal Client ID', required: false })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ description: 'PayPal Client Secret', required: false })
  @IsString()
  @IsOptional()
  clientSecret?: string;

  @ApiProperty({ description: 'Test mode enabled', required: false })
  @IsBoolean()
  @IsOptional()
  testMode?: boolean;
}

class SaveStepConfigDto {
  @ApiProperty({ description: 'Provider name', required: false })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({ description: 'Is enabled', required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: 'Is configured', required: false })
  @IsBoolean()
  @IsOptional()
  configured?: boolean;

  @ApiProperty({ description: 'Additional configuration', required: false })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

@ApiTags('System Configuration')
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({
    status: 200,
    description: 'System configuration retrieved successfully',
  })
  async getConfig() {
    const config = await this.systemConfigService.getConfig();
    return {
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Get system configuration status' })
  @ApiResponse({
    status: 200,
    description: 'System status retrieved successfully',
  })
  async getStatus() {
    const status = await this.systemConfigService.getStatus();
    return {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('initialized')
  @Public()
  @ApiOperation({ summary: 'Check if system is initialized' })
  @ApiResponse({
    status: 200,
    description: 'Returns initialization status',
  })
  async isInitialized() {
    const initialized = await this.systemConfigService.isInitialized();
    return {
      success: true,
      data: { initialized },
      timestamp: new Date().toISOString(),
    };
  }

  @Patch()
  @Public()
  @ApiOperation({ summary: 'Update system configuration (public during setup)' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
  })
  async updateConfig(@Body() data: Partial<SystemConfiguration>) {
    const config = await this.systemConfigService.updateConfig(data);
    return {
      success: true,
      data: config,
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('complete-setup')
  @Public()
  @ApiOperation({ summary: 'Complete the setup wizard' })
  @ApiResponse({
    status: 200,
    description: 'Setup completed successfully',
  })
  async completeSetup() {
    const config = await this.systemConfigService.completeSetup();
    return {
      success: true,
      data: config,
      message: 'Setup completed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset')
  @Public()
  @ApiOperation({ summary: 'Reset system to setup mode' })
  @ApiResponse({
    status: 200,
    description: 'System reset to setup mode',
  })
  async resetSetup() {
    const config = await this.systemConfigService.resetSetup();
    return {
      success: true,
      data: config,
      message: 'System reset to setup mode',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test-database')
  @Public()
  @ApiOperation({ summary: 'Test database connection' })
  @ApiBody({ type: TestDatabaseConnectionDto })
  @ApiResponse({
    status: 200,
    description: 'Database connection test result',
  })
  async testDatabaseConnection(@Body() config: TestDatabaseConnectionDto) {
    const result = await this.systemConfigService.testDatabaseConnection(config);
    return {
      success: result.success,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test-ai')
  @Public()
  @ApiOperation({ summary: 'Test AI provider connection' })
  @ApiBody({ type: TestAIConnectionDto })
  @ApiResponse({
    status: 200,
    description: 'AI provider connection test result',
  })
  async testAIConnection(@Body() config: TestAIConnectionDto) {
    const result = await this.systemConfigService.testAIConnection(config);
    return {
      success: result.success,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test-payment')
  @Public()
  @ApiOperation({ summary: 'Test payment provider connection' })
  @ApiBody({ type: TestPaymentConnectionDto })
  @ApiResponse({
    status: 200,
    description: 'Payment provider connection test result',
  })
  async testPaymentConnection(@Body() config: TestPaymentConnectionDto) {
    const result = await this.systemConfigService.testPaymentConnection(config);
    return {
      success: result.success,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin-credentials')
  @Public()
  @ApiOperation({ summary: 'Get super admin credentials (one-time only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin credentials (only returned once after setup)',
  })
  async getSuperAdminCredentials() {
    const credentials = await this.systemConfigService.getSuperAdminCredentials();
    if (!credentials) {
      return {
        success: false,
        data: null,
        message: 'Admin credentials have already been viewed or setup not completed',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: credentials,
      message: 'Save these credentials securely. They will not be shown again.',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('save-step/:step')
  @Public()
  @ApiOperation({ summary: 'Save wizard step configuration' })
  @ApiParam({ name: 'step', enum: ['database', 'ai', 'payment', 'storage'] })
  @ApiBody({ type: SaveStepConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Step configuration saved successfully',
  })
  async saveStepConfig(
    @Param('step') step: 'database' | 'ai' | 'payment' | 'storage',
    @Body() config: SaveStepConfigDto,
  ) {
    const updatedConfig = await this.systemConfigService.saveStepConfig(step, config);
    return {
      success: true,
      data: updatedConfig,
      message: `${step} configuration saved successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('ai-credentials')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update AI provider credentials' })
  @ApiBody({ type: UpdateAIConfigDto })
  @ApiResponse({
    status: 200,
    description: 'AI credentials updated successfully',
  })
  async updateAICredentials(@Body() config: UpdateAIConfigDto) {
    const result = await this.systemConfigService.updateAICredentials(config);
    return {
      success: true,
      data: result,
      message: 'AI credentials updated successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('seed-admin')
  @Public()
  @ApiOperation({ summary: 'Seed super admin user' })
  @ApiResponse({
    status: 200,
    description: 'Super admin seeded successfully',
  })
  async seedSuperAdmin() {
    const result = await this.systemConfigService.seedSuperAdmin();
    if (!result) {
      return {
        success: false,
        data: null,
        message: 'Super admin already exists or could not be created',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: result,
      message: 'Super admin created. Save these credentials securely!',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('database-credentials')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update database provider credentials' })
  @ApiBody({ type: UpdateDatabaseConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Database credentials updated successfully',
  })
  async updateDatabaseCredentials(@Body() config: UpdateDatabaseConfigDto) {
    const result = await this.systemConfigService.updateDatabaseCredentials(config);
    return {
      success: true,
      data: result,
      message: 'Database credentials updated successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('payment-credentials')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update payment provider credentials' })
  @ApiBody({ type: UpdatePaymentConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Payment credentials updated successfully',
  })
  async updatePaymentCredentials(@Body() config: UpdatePaymentConfigDto) {
    const result = await this.systemConfigService.updatePaymentCredentials(config);
    return {
      success: true,
      data: result,
      message: 'Payment credentials updated successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('storage-credentials')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update storage provider credentials' })
  @ApiBody({ type: UpdateStorageConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Storage credentials updated successfully',
  })
  async updateStorageCredentials(@Body() config: UpdateStorageConfigDto) {
    const result = await this.systemConfigService.updateStorageCredentials(config);
    return {
      success: true,
      data: result,
      message: 'Storage credentials updated successfully!',
      timestamp: new Date().toISOString(),
    };
  }
}
