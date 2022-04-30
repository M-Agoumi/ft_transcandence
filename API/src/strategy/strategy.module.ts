import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { StrategyService } from './strategy.service';

@Module({
  // imports: [UserModule],
  // providers: [StrategyService]
  exports: [StrategyService]
})
export class StrategyModule {}
