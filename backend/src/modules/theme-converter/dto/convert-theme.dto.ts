import { IsBoolean, IsOptional } from 'class-validator';

export class ConvertThemeDto {
  @IsOptional()
  @IsBoolean()
  useTailwind?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeComments?: boolean = true;

  @IsOptional()
  @IsBoolean()
  formatCode?: boolean = true;
}
