import { Module, HttpService } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './dto/user.entity';
// import { JtwGuard } from 'src/auth/guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelperService } from './user-helper/user-helper.service';
// import { Strategy42 } from './strategy/strategy';
import { HttpModule } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import { UserStats } from './dto/stats.entity';
import { Match } from './dto/match.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { StrategyService } from 'src/strategy/strategy.service';
import { TfaUser } from 'src/2FA/user.2fa.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserStats, Match, TfaUser]),
    HttpModule,
    MailerModule.forRoot({
      transport: {
        service: "gmail",
        secure: false,
        auth: {
          user: 'ennimizi@gmail.com',
          pass: 'this is a test'
        }
      },
      defaults: {
          from: '"No Reply" <ennimizi@gmail.com>'
      },
    }),
    //may need to import 42module or something
      // synchronize: true,]
    
  ],
  controllers: [UserController],
  providers: [UserHelperService, StrategyService, ConfigService,UserService],exports:[UserService]
})
export class UserModule { }