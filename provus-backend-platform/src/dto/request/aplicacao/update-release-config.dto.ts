import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReleaseConfigDto {
  @IsOptional()
  @IsBoolean()
  mostrarPontuacao?: boolean;

  @IsOptional()
  @IsBoolean()
  permitirRevisao?: boolean;
}
