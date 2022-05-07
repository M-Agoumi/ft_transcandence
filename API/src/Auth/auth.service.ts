import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private jwt: JwtService, 
		private configService: ConfigService
		){}

	async signup(login: string)
	{
		
		return (this.signToken(login))
	}

	async signToken(Login: string)
	{
		const payload = {
			login: Login
		}
		return (this.jwt.signAsync(payload, {
			expiresIn: '15d',
			secret: this.configService.get('JWT_SECRET')
		}))
	}
}
