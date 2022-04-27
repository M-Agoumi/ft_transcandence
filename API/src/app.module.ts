import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './user/dto/match.entity';
import { UserStats } from './user/dto/stats.entity';
import { UserEntity } from './user/dto/user.entity';
import { UserController } from './user/user.controller';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({
    type: 'postgres',
    host: '10.11.100.84',
    port: 35000,
    username: 'user',
    password: 'password',
    database: 'db',
    entities: [UserEntity, UserStats, Match],
    synchronize: true,}),],
  // controllers: [UserController],
  // providers: [UserService],
})
export class AppModule { }
