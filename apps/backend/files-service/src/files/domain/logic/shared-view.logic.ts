import { FileEntity, FolderEntity } from '../entities';

/**
 * Filters a list of shared resources to return only the "Top Level" items.
 * * Rule: If an item (File or Folder) has a parentId, and that parent is ALSO
 * in the provided list of folders, the item is hidden (nested).
 */
export function filterTopLevelSharedItems(
  files: FileEntity[],
  folders: FolderEntity[]
): { files: FileEntity[]; folders: FolderEntity[] } {
  const sharedFolderIds = new Set(folders.map((f) => f._id?.toString()).filter((id): id is string => !!id));

  const isRootFolder = (folder: FolderEntity) => {
    if (!folder.parentFolderId) return true;
    return !sharedFolderIds.has(folder.parentFolderId.toString());
  };

  const isRootFile = (file: FileEntity) => {
    if (!file.parentFolderId) return true;
    return !sharedFolderIds.has(file.parentFolderId.toString());
  };

  return {
    folders: folders.filter(isRootFolder),
    files: files.filter(isRootFile),
  };
}
