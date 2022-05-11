import { Body, Controller, Get, Header, Param, ParseIntPipe, Patch, Post, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { map, Observable, of, retry, switchMap } from 'rxjs';
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
import { response } from 'express';

// import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios'
import { Stats } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import path from 'path';
// import { User } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { join } from 'path';

@UseGuards(My_guard)
@Controller('users')
export class UserController {
	constructor(private userservice: UserService, private userHelper: UserHelperService,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,) { }


	@Get('sendEmail')
	async sendEmail(@Body('email') email: string) {
		await this.userservice.sendMail(email);
		console.log(email)
		return 'done'
	}

	// @Post('signup')
	// hi(@Body('code') code: string) {
	// 	return (this.userservice.get_tk_li(code))
	// }
	
	@Post('username')
	async add_user_name(@GetUser() user: any, @Body('username') username:string)
	{
		// console.log(user)
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true && await this.userservice.add_username(ret.login, username))
		// {
		// 	return ({status:'si'});
		// }
		// return ({status:'no'});
		// return ('in')
		return await this.userservice.add_username(user.login, username)
	}

	@Get('username')
	async get_user_name(@GetUser() user: any)
	{
		if (user.username)
		{
			console.log(user)
			return {username:user.username}
		}
		else
			return {username: undefined}
	}

	@Post('friends')
	async add_friend(@GetUser() user: any, @Body('username') username: string) {
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true)
		// 	return (this.userservice.add_friend(ret.login, username))
		// return ('no');
		return await this.userservice.add_friend(user.login, username)
	}

	@Get('friends')
	async get_friends(@GetUser() user: any) {
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true)
		// 	return (this.userservice.get_friends(ret.login))
		// return ('no');
		return await this.userservice.get_friends(user.login)
	}
		
	@Get('all')
	async findAll(@Param('token') token: string) {
		return this.userservice.get_all_users()
	}
		
	@Post('avatar')
	@UseInterceptors(FileInterceptor('file', {storage: diskStorage({
		destination: './uploads/profileImages',
		filename: (req, file, cb) => {
			cb(null, `${file.originalname}`)
		}
	})}))
	async uploadFile(@UploadedFile() file,@GetUser() user: any)
	{
		// const ret = await this.userservice.check_if_token_valid(token)
		// if (ret.stats === true)
		// {
		//  console.log(typeof(file.buffer))
		// this.userservice.addAvatar(user.login, file.buffer, file.originalname)
		// console.log(user)
		// }
		// return ({status:'no'});
		// console.log(file)
		user.imagePath = file.path;
		this.userRepository.save(user);
		return of({imagePath: file.path})
	}

	@Get('avatar')
	get_image(@GetUser() user: any, @Res() res)
	{
		// console.log(user)
		return of (res.sendFile(join(process.cwd(), user.imagePath)))
	}

	// @Get('avatar/:id')
	// async getDatabaseFilebyId(@Res({passthrough: true}) response: Response, @Param('id', ParseIntPipe) id: number)
	// {
	// 	console.log('here');
	// 	// const ret = await this.userservice.check_if_token_valid(token)
	// 	// if (ret.stats === true)
	// 	// {
	// 		const file = await this.userservice.getFileByLogin(id)
	// 		const stream = Readable.from(file.data)
	// 		response.set({
	// 			'Content-Disposition': `inline; filename="${file.filename}"`,
	// 			'Content-Type': 'image'
	// 		})
	// 		return new StreamableFile(stream);
	// 		// console.log(response)
	// 	// }
	// 	// return ({status:'no'});
	// }

	@Post('delete')
	delete()
	{
		this.userservice.delete_all()
	}
		
	@Get(':username')
	async get_user_by_username(@GetUser() user: any,@Param('username') username:string)
	{
		return await this.userservice.get_user_by_username(username)
	}
	// @Post('login')
	// login(@Body() loginUserDto: LoginUserDto) {
	// 	return (this.userservice.login(loginUserDto))
	// }
}