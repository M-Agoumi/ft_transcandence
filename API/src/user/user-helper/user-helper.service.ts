import { Injectable } from '@nestjs/common'
import { of } from 'rxjs'
import { CreateUserDto } from '../dto/create-user.dto'
import { LoginUserDto } from '../dto/login-user.dto'

@Injectable()
export class UserHelperService {


	CreatUserDtoEntity(UserDto: CreateUserDto) {
		return  of( {
			email: UserDto.email,
			username: UserDto.username,
			password: UserDto.password
		})
	}
	
	loginUserDtoToEntity(UserDto: LoginUserDto){
		return {
			email: UserDto.email,
			password: UserDto.password
		}
	}
}
