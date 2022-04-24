import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Observable, switchMap } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserI } from './dto/user.interface';
import { UserHelperService } from './user-helper/user-helper.service';
import { UserService } from './user.service';

// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
// import { User } from '@prisma/client'

@Controller('users')
export class UserController {
	constructor(private userservice: UserService, private userHelper: UserHelperService) { }

	@Post('signup')
	create(@Body() createUserDto: CreateUserDto){
		return (this.userHelper.CreatUserDtoEntity(createUserDto).pipe(switchMap((user: UserI) => this.userservice.create(user))));
		// return (true);
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
