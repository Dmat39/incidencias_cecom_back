import { PartialType } from '@nestjs/swagger';
import { CreateIncidenciaDto } from './create-incidencia.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateIncidenciaDto extends PartialType(CreateIncidenciaDto) {}

export class UpdateEstadoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  situacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  estadoProcesoId?: number;
}

export class UpdateAtencionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcionIntervencion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreAgraviado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefonoAgraviado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  atendidoEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  generoAgresorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  generoVictimaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  severidadProcesoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  estadoProcesoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  situacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  severidadId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  medioId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  operadorId?: number;
}

export class UpdateSerenosDto {
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  serenosIds?: number[];
}
