import { Module } from '@nestjs/common';
import { JtwGuard } from 'src/auth/guard';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController]
})
export class UserModule {}
