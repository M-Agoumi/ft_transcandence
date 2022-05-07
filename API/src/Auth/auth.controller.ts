import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserI } from 'src/user/dto/user.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { userTokenI } from './interface/token.interface'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService,
		// private userservice: UserService
		) {}

	@Post('token')
	signup(@Body('code') code: string)
	{
		// const login = this.userservice.get_tk_li(code)
		// return (this.authService.signup(login))
	}
	// hi(@Body('code') code: string) {
	// 	return (this.userservice.get_tk_li(code))
	// }
	
}
