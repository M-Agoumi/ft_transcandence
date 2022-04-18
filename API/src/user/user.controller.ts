import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { GetUser } from 'src/auth/decorator';
import { JtwGuard } from 'src/auth/guard';
import { User } from '@prisma/client'

@UseGuards(JtwGuard)
@Controller('users')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User){
		// console.log({
		// 	user: req.user,
		// })
		return (user)
	}

	@Patch()
	editUser(){}
}
