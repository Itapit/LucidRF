import { FilesClientModule } from '@LucidRF/files-contracts';
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [FilesClientModule],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
