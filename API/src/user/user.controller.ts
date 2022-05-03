import { Body, Controller, Get, Header, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { map, Observable, retry, switchMap } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserI } from './dto/user.interface';
import { UserHelperService } from './user-helper/user-helper.service';
import { UserService } from './user.service';
import { User } from './decorators/user.decorator'
import { Profile } from 'passport';
import { My_guard } from './guard/guard';
// import { LocalStorage } from 'node-localstorage' 
import { LocalStorage } from "node-localstorage";
import { TfaUser } from 'src/2FA/user.2fa.entity';
import { response } from 'express';

// import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios'
// import { User } from '@prisma/client'

@Controller('users')
export class UserController {
	constructor(private userservice: UserService, private userHelper: UserHelperService) { }


	@Get('sendEmail')
	sendEmail(@Body('email') email: string) {
		// const user= new TfaUser;
		// user.email = email
		// console.log('heew')
		// console.log(user.email);
		this.userservice.sendConfirmationEmail(email);
		return 'done'
	}

	@Post('signup')
	hi(@Body('code') code: string) {
		// this.userservice.get_tk_li(code)
		// console.log('------------------------------------------------------------------------------------')
		// console.log(code);
		// console.log('------------------------------------------------------------------------------------')
		return (this.userservice.get_tk_li(code))
	}
	

	@Post('test')
	test(@Body() token: any){
		console.log('------------------------------------------------------------------------------------')
		console.log(token)
	}
	// @Post('username/:login')
	// add_user_name(@Body('username') username:string, @Param('login') login: string)
	// {
	// 	this.userservice.add_username(login, username);
	// }

	// @Get(':login')
	// getUserData(@Param('login') login: string)
	// {
	// 	return (this.userservice.GetUserData(login));
	// }

	@Get('all')
	findAll() {
		// console.log(req.cookies['iariss']); // or "request.cookies['cookieKey']"
		// console.log(req.signedCookies);
		// res.cookie('login', 'iariss');
		console.log('heh')
		return (this.userservice.get_all_users());
	}
	// delete()
	// {
	// 	this.userservice.delete_all()
	// }

	// @Post('login')
	// login(@Body() loginUserDto: LoginUserDto) {
	// 	return (this.userservice.login(loginUserDto))
	// }
}