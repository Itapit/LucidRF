import { FileDto, FolderDto } from '@LucidRF/common';

export type UnifiedResource = (FolderDto & { isFolder: true }) | (FileDto & { isFolder: false });
