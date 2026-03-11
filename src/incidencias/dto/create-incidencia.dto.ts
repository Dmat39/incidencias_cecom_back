import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateIncidenciaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  unidadId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoCasoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  subTipoCasoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoReportanteId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreReportante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefonoReportante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  ocurridoEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  severidadId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  jurisdiccionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  situacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  medioId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  operadorId?: number;
}
