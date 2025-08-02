import type { IFolder } from "~/types/IBank";
import type { IFile } from "~/types/IFile";
import type { IQuestao } from "~/types/IQuestao";

export default function isFolder(
  item: IFolder | IQuestao | IFile
): item is IFolder {
  return "filhos" in item;
}
