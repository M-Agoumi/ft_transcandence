import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { TfaUser } from './2FA/user.2fa.entity';
import { AppService } from './app.service';

// @Controller('')
// export class appController {
// 	constructor(private appservice: AppService){}
// 	@Get()
// 	@Render('index')
// 	root() { }

// 	@Get('verify')
// 	@Render('verify')
// 	VerifyEmail() { }

// 	@Post('signup')
// 	async Signup(@Body() user: TfaUser) {
// 		return await this.appservice.signup(user);
// 	}
// 	@Post('signin')
// 	async Signin(@Body() user: TfaUser) {
// 	return await this.appservice.signin(user);
// 	}
// 	@Post('verify')
// 	async Verify(@Body() body) {
// 	return await this.appservice.verifyAccount(body.code)
//  }
// }