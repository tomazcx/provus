import type { IFolder } from "~/types/IBank";
import type { IQuestao } from "~/types/IQuestao";

export default function isFolder(item: IFolder | IQuestao): item is IFolder {
  return "filhos" in item;
}
