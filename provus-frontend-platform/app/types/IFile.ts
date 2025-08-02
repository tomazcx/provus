import type TipoArquivoEnum from "~/enums/TipoArquivoEnum";
import type { IFolder, ItemSistemaDeArquivos } from "./IBank";

export interface IFile extends ItemSistemaDeArquivos {
  tipo: TipoArquivoEnum;
  url: string;
  descricao?: string;
  tamanhoEmBytes?: number;
}

export type TMaterialBankItem = IFolder | IFile;
