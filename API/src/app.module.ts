import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './user/entities/match.entity';
import { UserStats } from './user/entities/stats.entity';
import { UserEntity } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { HttpModule } from 'nestjs-http-promise'
import AVatar from './user/entities/file.entity';
import { AuthModule } from './Auth/auth.module';
import { appController } from './app.controller';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({
    type: 'postgres',
    host: '10.11.100.84',
    port: 35000,
    username: 'user',
    password: 'password',
    database: 'db',
    entities: [UserEntity, UserStats, Match, AVatar],
    synchronize: true,
  }), UserModule, HttpModule, AuthModule, ConfigModule.forRoot({
    validationSchema: Joi.object({
      JWT2FA_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
      JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      EMAIL_CONFIRMATION_URL: Joi.string().required(),
      EMAIL_SERVICE: Joi.string().required(),
      EMAIL_USER: Joi.string().required(),
      EMAIL_PASSWORD: Joi.string().required(),
      // ...
    }),
  }),ScheduleModule.forRoot(),
  MailerModule

    // MailerModule.forRoot({
    //   transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    //   defaults: {
    //     from: '"nest-modules" <modules@nestjs.com>',
    //   },
    //   template: {
    //     dir: __dirname + '/templates',
    //     adapter: new PugAdapter(),
    //     options: {
    //       strict: true,
    //     },
    //   },
    // }),
    // template: {
    //   dir: join(__dirname, "../views/email-templates"),
    //   adapter: new HandlebarsAdapter(), 
    //   options: {
    //     strict: true,
    //   },
  ],
  controllers: [appController],
  // providers: [UserService],
})
export class AppModule { }
