import { SdrFileExtension } from '../enums/sdr-file-extension.enum';

export function isSdrFile(fileName?: string | null): boolean {
  if (!fileName) return false;
  const lowerName = fileName.toLowerCase();
  return Object.values(SdrFileExtension).some((ext) => lowerName.endsWith(ext as string));
}
