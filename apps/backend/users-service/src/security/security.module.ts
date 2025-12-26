import { Module } from '@nestjs/common';
import { PasswordService } from './interfaces';
import { BcryptPasswordService } from './services';

@Module({
  providers: [
    {
      provide: PasswordService,
      useClass: BcryptPasswordService,
    },
  ],
  exports: [PasswordService],
})
export class SecurityModule {}
