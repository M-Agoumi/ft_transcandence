import { Module, HttpService } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity';
// import { JtwGuard } from 'src/auth/guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelperService } from './user-helper/user-helper.service';
import { HttpModule } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import { UserStats } from './entities/stats.entity';
import { Match } from './entities/match.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { TfaUser } from 'src/2FA/user.2fa.entity';
import AVatar from './entities/file.entity';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserStats, Match, TfaUser, AVatar]),
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
    JwtModule.register({}),
    //may need to import 42module or something
    // synchronize: true,]

  ],
  controllers: [UserController],
  providers: [UserHelperService, ConfigService, UserService], exports: [UserService]
})
export class UserModule { }