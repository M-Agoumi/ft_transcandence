import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user/dto/user.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { TfaUser } from './2FA/user.2fa.entity';
import * as argon from "argon2"
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AppService {
}