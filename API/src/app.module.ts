import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { appController } from './app.controller';
import { Match } from './user/dto/match.entity';
import { UserStats } from './user/dto/stats.entity';
import { UserEntity } from './user/dto/user.entity';
import { UserController } from './user/user.controller';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { StrategyModule } from './strategy/strategy.module';
import { MailerModule } from '@nestjs-modules/mailer'
import { TfaUser } from './2FA/user.2fa.entity';
import { HttpModule } from 'nestjs-http-promise'
import { join } from 'path/posix';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({
    type: 'postgres',
    host: '10.11.100.84',
    port: 35000,
    username: 'user',
    password: 'password',
    database: 'db',
    entities: [UserEntity, UserStats, Match, TfaUser],
    synchronize: true,
  }), UserModule,
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
  // controllers: [UserController],
  // providers: [UserService],
})
export class AppModule { }
