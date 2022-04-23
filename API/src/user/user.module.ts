import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './dto/user.entity';
// import { JtwGuard } from 'src/auth/guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelperService } from './user-helper/user-helper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
      // synchronize: true,]
    
  ],
  controllers: [UserController],
  providers: [UserService, UserHelperService]
})
export class UserModule { }