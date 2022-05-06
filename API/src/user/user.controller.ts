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
import { Stats } from 'fs';
// import { User } from '@prisma/client'

@Controller('users')
export class UserController {
	constructor(private userservice: UserService, private userHelper: UserHelperService) { }


	@Get('sendEmail')
	sendEmail(@Body('email') email: string) {
		this.userservice.sendConfirmationEmail(email);
		return 'done'
	}

	@Post('signup')
	hi(@Body('code') code: string) {
		return (this.userservice.get_tk_li(code))
	}
	
	@Post('username/:token')
	async add_user_name(@Body('username') username:string, @Param('token') token: string)
	{
		const ret = await this.userservice.check_if_token_valid(token)
		if (ret.stats === true && await this.userservice.add_username(ret.login, username))
		{
			return ({status:'si'});
		}
		return ({status:'no'});
	}

	@Post('friends/:token')
	async add_friend(@Body('username') username:string, @Param('token') token: string) {
		const ret = await this.userservice.check_if_token_valid(token)
		if (ret.stats === true)
			return (this.userservice.add_friend(ret.login, username))
		return ('no');
	}

	@Get('friends/:token')
	async get_friends(@Body('username') username:string, @Param('token') token: string) {
		const ret = await this.userservice.check_if_token_valid(token)
		if (ret.stats === true)
			return (this.userservice.get_friends(ret.login))
		return ('no');
	}
		
	@Get('all/:token')
	async findAll(@Param('token') token: string) {
		const ret = await this.userservice.check_if_token_valid(token)
		if (ret.stats === true)
		{
			return this.userservice.get_all_users()
		}
		return ('no');
	}
		
		
		
	@Post('delete')
	delete()
	{
		this.userservice.delete_all()
	}
		
	@Post(':username/:token')
	async get_user_by_username(@Param('username') username:string, @Param('token') token: string)
	{
		const ret = await this.userservice.check_if_token_valid(token)
		if (ret.stats === true)
		{
			return await this.userservice.get_user_by_username(username)
			return ({status:'si'});
		}
		return ({status:'no'});
	}
	// @Post('login')
	// login(@Body() loginUserDto: LoginUserDto) {
	// 	return (this.userservice.login(loginUserDto))
	// }
}