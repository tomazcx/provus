import type { ItemEntity } from "./Item.entity";
import type TipoItemEnum from "~/enums/TipoItemEnum";

export interface ArquivoEntity extends ItemEntity {
  tipo: TipoItemEnum.ARQUIVO;
  url: string;
  descricao?: string;
  tamanhoEmBytes: number;
}
