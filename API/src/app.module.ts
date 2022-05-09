import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { appController } from './app.controller';
import { Match } from './user/entities/match.entity';
import { UserStats } from './user/entities/stats.entity';
import { UserEntity } from './user/entities/user.entity';
import { UserController } from './user/user.controller';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { MailerModule } from '@nestjs-modules/mailer'
import { TfaUser } from './2FA/user.2fa.entity';
import { HttpModule } from 'nestjs-http-promise'
import { join } from 'path/posix';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import AVatar from './user/entities/file.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './Auth/auth.controller';
import { AuthModule } from './Auth/auth.module';
import { appController } from './app.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({
    type: 'postgres',
    host: '10.11.100.84',
    port: 35000,
    username: 'user',
    password: 'password',
    database: 'db',
    entities: [UserEntity, UserStats, Match, TfaUser, AVatar],
    synchronize: true,
  }), UserModule,HttpModule,AuthModule,
  MailerModule.forRoot({
    transport: {
      service: "gmail",
      secure: false,
      auth: {
        user: 'ennimizi@gmail.com',
        pass: '',
      },
    },
    defaults: {
      from: '"No Reply" <ennimizi@gmail.com>',
    },
    // template: {
    //   dir: join(__dirname, "../views/email-templates"),
    //   adapter: new HandlebarsAdapter(), 
    //   options: {
    //     strict: true,
    //   },
  }
  )],
  controllers: [appController],
  // providers: [UserService],
})
export class AppModule { }
