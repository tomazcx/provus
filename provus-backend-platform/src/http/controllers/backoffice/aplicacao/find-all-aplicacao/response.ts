import { ApiProperty } from '@nestjs/swagger';
import { AvaliacaoDto } from 'src/dto/result/avaliacao/avaliacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';

export class FindAllAplicacoesResponse {
  @ApiProperty({
    description: 'ID da aplicação',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Avaliação',
  })
  avaliacao: AvaliacaoDto;

  @ApiProperty({
    description: 'Estado da aplicação',
    example: EstadoAplicacaoEnum.AGENDADA,
  })
  estado: EstadoAplicacaoEnum;

  @ApiProperty({
    description: 'Código de acesso da aplicação',
    example: '123456',
  })
  codigoAcesso: string;

  @ApiProperty({
    description: 'Data de início da aplicação',
    example: '2021-01-01',
  })
  dataInicio: string;

  @ApiProperty({
    description: 'Data de finalização da aplicação',
    example: '2021-01-01',
  })
  dataFim: string;
}
