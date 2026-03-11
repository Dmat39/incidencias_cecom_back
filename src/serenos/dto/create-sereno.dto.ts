import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSerenoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  habilitado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  cargoSerenoId?: number;
}
