import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateIncidenciaDto {
  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La unidad es obligatoria' })
  @IsInt()
  unidadId: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'El tipo de caso es obligatorio' })
  @IsInt()
  tipoCasoId: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'El subtipo de caso es obligatorio' })
  @IsInt()
  subTipoCasoId: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'El tipo de reportante es obligatorio' })
  @IsInt()
  tipoReportanteId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreReportante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefonoReportante?: string;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString()
  direccion: string;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La latitud es obligatoria' })
  @IsNumber()
  @Type(() => Number)
  latitud: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La longitud es obligatoria' })
  @IsNumber()
  @Type(() => Number)
  longitud: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  descripcion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  ocurridoEn?: string;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La severidad es obligatoria' })
  @IsInt()
  severidadId: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'La jurisdicción es obligatoria' })
  @IsInt()
  jurisdiccionId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  situacionId?: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'El medio es obligatorio' })
  @IsInt()
  medioId: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'El operador es obligatorio' })
  @IsInt()
  operadorId: number;
}
