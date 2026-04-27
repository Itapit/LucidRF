import { FileDto } from '../domain/dtos/file.dto';

export class FileUploadedEvent {
  constructor(public readonly file: FileDto) {}
}
