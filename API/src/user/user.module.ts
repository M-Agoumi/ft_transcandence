import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './dto/user.entity';
// import { JtwGuard } from 'src/auth/guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelperService } from './user-helper/user-helper.service';
import { Strategy_42 } from './strategy/strategy';
import { ConfigService } from '@nestjs/config';
import { UserStats } from './dto/stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserStats])
    //may need to import 42module or something
      // synchronize: true,]
    
  ],
  controllers: [UserController],
  providers: [UserService, UserHelperService, Strategy_42, ConfigService]
})
export class UserModule { }