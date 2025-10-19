/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  DadosRespostaDiscursiva,
  DadosRespostaObjetiva,
  DadosRespostaMultipla,
} from '../types/dados-resposta.type';

export function isDadosRespostaDiscursiva(
  data: any,
): data is DadosRespostaDiscursiva {
  return (
    typeof data === 'object' && data !== null && typeof data.texto === 'string'
  );
}

export function isDadosRespostaObjetiva(
  data: any,
): data is DadosRespostaObjetiva {
  return (
    typeof data === 'object' &&
    data !== null &&
    (typeof data.alternativa_id === 'number' || data.alternativa_id === null)
  );
}

export function isDadosRespostaMultipla(
  data: any,
): data is DadosRespostaMultipla {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('alternativas_id' in data)
  ) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const potentialArray = data.alternativas_id;
  if (!Array.isArray(potentialArray)) {
    return false;
  }

  return potentialArray.every((id: unknown) => typeof id === 'number');
}
