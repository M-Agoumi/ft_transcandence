import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getRepositoryToken, InjectRepository, } from '@nestjs/typeorm';
import { UserEntity } from './dto/user.entity';
import { Repository } from 'typeorm';
import { UserI } from './dto/user.interface';
import { from, map, Observable, switchMap } from 'rxjs';
import { bcrypt } from 'bcryptjs';
import * as argon from "argon2"
import { stringify } from 'querystring';
import { LoginUserDto } from './dto/login-user.dto';
import { Strategy_42 } from './strategy/strategy';


@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		service_42: Strategy_42
	) {
	}
	async get_all_users()
	{
		
		return await this.userRepository.manager.find(UserEntity);
	}

	async remove_user(user: LoginUserDto)
	{
		const email = user.email;
		const to_be_removed = await this.userRepository.findOneBy({email})
		if (to_be_removed)
		{
			console.log(`removing ${to_be_removed.username}`)
			await this.userRepository.remove(to_be_removed);
			console.log(`removed`)
		}
	}

	async create(newUser: UserI) {
		try {
			await this.mailExists(newUser.email).pipe(
				switchMap((exists: boolean): Observable<boolean> => {
					if (exists)
						throw new HttpException('email aleady in use', HttpStatus.CONFLICT);
					let some: Observable<boolean>;
					return (some);
				})
			)
			//generate the password hash
			const hash = await argon.hash(newUser.password);
			newUser.password = hash;
			///save user
			const user = this.userRepository.save(newUser);
		}
		catch (error) {
			if (/*error instanceof PrismaClientKnownRequestError && */error.code === 'P2002') {
				throw new ForbiddenException('Credentials Taken')
			}
		}
	}

	// private hashPassword(password: string): Observable<string> {
	// 	return from<string>(bcrypt.hash(password, 12));
	// }

	private findOne(id: number) {
		return from(this.userRepository.findOneBy({ id }));
	}

	private  mailExists(email: string) {
		return from(this.userRepository.findOneBy({ email })).pipe(
			map((user: UserI) => {
				if (user)
					return true
				return false;
			}))
	}

	async login(user: LoginUserDto)
	{
		const email = user.email;
		const returned_user = await this.userRepository.findOneBy({email})
		if (!returned_user) throw new ForbiddenException('Credentials icorrect')
		console.log(user.password)
		const pwMatches = await argon.verify(returned_user.password, user.password);
		if (!pwMatches) throw new ForbiddenException('Credentials icorrect')
		console.log('logged in');
		// returned_user.password = "";
		return returned_user
	}
x
}
