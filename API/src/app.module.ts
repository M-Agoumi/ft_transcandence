import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user/dto/user.entity';
import { UserController } from './user/user.controller';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [UserModule, ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({
    type: 'postgres',
    host: '10.11.100.84',
    port: 35000,
    username: 'user',
    password: 'password',
    database: 'db',
    entities: [UserEntity],
    synchronize: true,}),]
  // controllers: [UserController],
  // providers: [UserService],
})
export class AppModule { }
