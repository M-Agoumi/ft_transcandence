import { HttpModule, HttpService, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TfaUser } from 'src/2FA/user.2fa.entity';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import AVatar from 'src/user/entities/file.entity';
import { Match } from 'src/user/entities/match.entity';
import { UserStats } from 'src/user/entities/stats.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([UserEntity, UserStats, Match, TfaUser, AVatar]),],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
