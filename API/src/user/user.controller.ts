import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Observable, switchMap } from 'rxjs';
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

// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
// import { User } from '@prisma/client'

@Controller('users')
export class UserController {
	constructor(private userservice: UserService, private userHelper: UserHelperService) { }


	@Get('sendEmail')
	sendEmail(@Body('email') email: string) {
		const user= new TfaUser;
		user.email = email
		console.log('heew')
		console.log(user.email);
		this.userservice.sendConfirmationEmail(user);
		return 'done'
	}

	@UseGuards(My_guard)
	@Get('signup')
	// create(@Body() createUserDto: CreateUserDto){
	// 	return (this.userHelper.CreatUserDtoEntity(createUserDto).pipe(switchMap((user: UserI) => this.userservice.create(user))));
	// 	// return (true);
	// }
	hi(@Res() res, @Req() req,@User() user:Profile) {
		console.log("Hello");
		// check the exitence ...

		// LocalStorage.set('login', 'iariss')
		// res.cookie('token', user);
		res.redirect("http://10.11.100.91:4200/login");
		// res.cookie('login', 'iariss');
		// console.log(user)



		return ({ button: 'hh' })
	}

	@Post('username/:login')
	add_user_name(@Body('username') username:string, @Param('login') login: string)
	{
		this.userservice.add_username(login, username);
	}

	@Get(':login')
	getUserData(@Param('login') login: string)
	{
		return (this.userservice.GetUserData(login));
	}

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