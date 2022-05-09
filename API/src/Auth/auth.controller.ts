import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserI } from 'src/user/dto/user.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { userTokenI } from './interface/token.interface'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService,
		private userservice: UserService
		) {}

	@Post('token')
	async signup(@Body('code') code: string)
	{
		let ret :{ stats: boolean; login: string}
		let token_username :{ access_token: string; username: string}
		// let access_token: string = "";
		ret = await this.userservice.get_tk_li(code)
		token_username = await this.authService.signToken(ret.login)
		console.log(token_username)
		return ({access_token: token_username.access_token, username: token_username.username})
	}
	// hi(@Body('code') code: string) {
	// 	return (this.userservice.get_tk_li(code))
	// }
	
}
