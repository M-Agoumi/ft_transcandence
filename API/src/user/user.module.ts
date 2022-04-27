import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './dto/user.entity';
// import { JtwGuard } from 'src/auth/guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelperService } from './user-helper/user-helper.service';
import { Strategy42 } from './strategy/strategy';
import { ConfigService } from '@nestjs/config';
import { UserStats } from './dto/stats.entity';
import { Match } from './dto/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserStats, Match]),
    //may need to import 42module or something
      // synchronize: true,]
    
  ],
  controllers: [UserController],
  providers: [UserHelperService, Strategy42, UserService, ConfigService],
})
export class UserModule { }