import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user/decorators';
import { codeDto } from 'src/user/dto/code.dto';
import { tokenDto } from 'src/user/dto/token.dto';
import { UserI } from 'src/user/dto/user.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { userTokenI } from './interface/token.interface'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService,
		private userservice: UserService
	) { }

	@Post('token')
	async signup(@Body() codedto: codeDto) {
		let ret: { stats: boolean; login: string, twoFa: boolean }
		let token_username_email: { access_token: string; username: string, email: string }
		// let access_token: string = "";
		ret = await this.userservice.get_tk_li(codedto.code)
		token_username_email = await this.authService.signToken(ret.login)
		if (ret.twoFa && token_username_email.email !== "") {
			this.userservice.sendVerificationLink(token_username_email.email, token_username_email.username);
		}
		return ({ access_token: token_username_email.access_token, username: token_username_email.username, twoFa: ret.twoFa })
	}

	@Post('confirm')
	async confirm(@Body() tokendto: tokenDto) {
		const username = await this.userservice.decodeConfirmationToken(tokendto.token);
		return await this.userservice.confirmEmail(username);
	}

}
