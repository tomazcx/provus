import type { FolderEntity, ItemEntity } from "~/types/entities/Item.entity";
import TipoItemEnum from "~/enums/TipoItemEnum";

export default function isFolder(item: ItemEntity): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}
