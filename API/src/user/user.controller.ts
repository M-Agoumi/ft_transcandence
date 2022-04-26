import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Observable, switchMap } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserI } from './dto/user.interface';
import { UserHelperService } from './user-helper/user-helper.service';
import { UserService } from './user.service';
import { User } from './decorators/user.decorator'
import { Profile } from 'passport';
import { My_guard } from './guard/guard';

// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
// import { User } from '@prisma/client'

@Controller('users')
export class UserController {
	constructor(private userservice: UserService, private userHelper: UserHelperService) { }

	@UseGuards(My_guard)
	@Get('signup')
	// test(@User() user: Profile) {
	// 	return { user };
	// }
	// create(@Body() createUserDto: CreateUserDto){
	// 	return (this.userHelper.CreatUserDtoEntity(createUserDto).pipe(switchMap((user: UserI) => this.userservice.create(user))));
	// 	// return (true);
	// }
	hi() {
		return ('<button> hello world</button>')
	}

	@Get('all')
	findAll() {
		return this.userservice.get_all_users();
	}

	@Post('login')
	login(@Body() loginUserDto: LoginUserDto) {
		return (this.userservice.login(loginUserDto))
	}
}
