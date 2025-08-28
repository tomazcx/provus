import TipoItemEnum from "~/enums/TipoItemEnum";
import type { IFolderListItem, TBankItem } from "~/types/IBank";

export default function isFolder(item: TBankItem): item is IFolderListItem {
  return item.tipo === TipoItemEnum.PASTA;
}
