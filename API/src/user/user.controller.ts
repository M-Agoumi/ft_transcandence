import { Body, Controller, Get, Header, Param, ParseIntPipe, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { map, Observable, retry, switchMap } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserI } from './dto/user.interface';
import { UserHelperService } from './user-helper/user-helper.service';
import { UserService } from './user.service';
import { GetUser } from './decorators/user.decorator'
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { AuthGuard } from '@nestjs/passport';
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
	
	@UseGuards(My_guard)
	@Post('username')
	async add_user_name(@GetUser() user: any)
	{
		console.log(user)
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true && await this.userservice.add_username(ret.login, username))
		// {
		// 	return ({status:'si'});
		// }
		// return ({status:'no'});
		return ('in')
	}

	@Post('username/:token')
	async get_user_name(@Param('token') token: string)
	{
		const ret = await this.userservice.check_if_token_valid(token)
		if (ret.stats === true)
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
		
	@Post('avatar/:token')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('token') token: string)
	{
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true)
		// {
			this.userservice.addAvatar("iariss", file.buffer, file.originalname)
		// }
		// return ({status:'no'});
	}

	@Get('avatar/:token')
	async getDatabaseFilebyId(@Res() response: Response, @Param('token') token: string, @Param('id', ParseIntPipe) id: number)
	{
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true)
		// {
			const file = await this.userservice.getFileByLogin(id)
			const stream = Readable.from(file.data)
			stream.pipe(response)
			// console.log(response)
		// }
		// return ({status:'no'});
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