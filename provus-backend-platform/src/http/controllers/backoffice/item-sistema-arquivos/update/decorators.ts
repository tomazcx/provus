import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { UpdateItemRequest } from 'src/http/models/response/update-items.request';

export const UpdateItemDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza o título de um item',
      description:
        'Atualiza o título de um item específico (como uma pasta) no sistema de arquivos.',
    }),
    ApiBody({
      type: UpdateItemRequest,
      description: 'O novo título para o item.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Item atualizado com sucesso.',
      type: ItemSistemaArquivosResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados inválidos (ex: título vazio).',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Item não encontrado ou não pertence ao usuário.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado.',
    }),
  );
};
