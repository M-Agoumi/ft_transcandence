import { ForbiddenException, Global, HttpException, HttpStatus, Injectable, Post } from '@nestjs/common';
import { getConnectionName, getRepositoryToken, InjectRepository, } from '@nestjs/typeorm';
import { UserEntity } from './dto/user.entity';
import { Repository } from 'typeorm';
import { UserI } from './dto/user.interface';
import { from, map, Observable, switchMap } from 'rxjs';
import { bcrypt } from 'bcryptjs';
import * as argon from "argon2"
import { stringify } from 'querystring';
import { LoginUserDto } from './dto/login-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { StrategyService } from 'src/strategy/strategy.service';
import { TfaUser } from 'src/2FA/user.2fa.entity';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios'
import { resolve } from 'path/posix';
import { rejects } from 'assert';


@Injectable()
export class UserService {
	private code;
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		service_42: StrategyService,
		private mailerService: MailerService,
		@InjectRepository(TfaUser) private usertfaRepository: Repository<TfaUser>,
		private readonly httpService: HttpService
	) {
		this.code = Math.floor(10000 + Math.random() * 90000)
	}
	async get_all_users() {

		return await this.userRepository.manager.find(UserEntity);
	}

	async remove_user(user: LoginUserDto) {
		const login = user.login;
		const to_be_removed = await this.userRepository.findOneBy({ login })
		if (to_be_removed) {
			console.log(`removing ${to_be_removed.username}`)
			await this.userRepository.remove(to_be_removed);
			console.log(`removed`)
		}
	}

	async sendEmail(email: string) {
		await this.mailerService.sendMail({
			to: email,
			subject: 'A test email',

		})
	}

	async get_tk_li(code: string) {
		let token = "";
		let ret = {
			token: "",
			stats: true,
			username: "",
			friends: []
		}
		try {
			const data = await this.httpService.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "authorization_code",
				"client_id": "141e88db7e82e987780696684a3a99056ad6d430de9d0ffb156406372cbcebac",
				"client_secret": "670f04780624e1a60b5a34f6ce5f88a28d2818541b5010de530ae72f445a03a5",
				"code": code,
				"redirect_uri": "http://10.11.100.91:4200/next"
			}).toPromise()
			ret.token = data.data.access_token;
			const info = await this.httpService.get('https://api.intra.42.fr/v2/me', {
				headers: {
					'Authorization': `Bearer ${ret.token}`
				}
			}).toPromise()
			console.log(ret.token)
			// fill user info to send to create
			let user = {} as UserI;
			user.login = info.data.login;
			user.access_token = ret.token;
			ret.username = await this.create(user);
		}
		catch (error) {
			ret.stats = false;
			return ret
		}
		(ret.username === undefined || ret.username === null) ? ret.username = "": 0
		return (ret)
	}

	async check_if_token_valid(token: string)
	{
		let ret = {
			login: "",
			token: "",
			stats: false,
		}
		try {
			// console.log('>>>>>>1', token)
			// console.log(token);
			const info = await this.httpService.get('https://api.intra.42.fr/v2/me', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}).toPromise()
			ret.login = info.data.login;
			ret.token = token;
			console.log(ret.login)
			console.log(ret.token)
			ret.stats = true
		}
		catch(error)
		{
			// console.log(error)
			ret.stats = false
			return ret
		}
		return (ret)
	}

	async create(newUser: UserI) {
		try {
			const login = newUser.login;
			const returned_user = await this.userRepository.findOneBy({login});
			if (!returned_user)
			{
				newUser.logged_in = true
				await this.userRepository.save(newUser);
				return ("")
			}
			else
			{
				console.log(newUser.access_token)
				returned_user.access_token = newUser.access_token
				await this.userRepository.save(returned_user);
			}
			return returned_user.username
		}
		catch (error) {
			console.log('in3l')
		}
		console.log('------------------------------------------------------------------------------------')
		console.log('here 1',(await this.userRepository.manager.find(UserEntity)))
		console.log('------------------------------------------------------------------------------------')
	}


	async add_friend(login: string, friend_username:string)
	{
		// const users = await this.userRepository.find({ relations: ["friends"] });
		// console.log(users);
		// console.log('my name', login);
		// console.log('my friend\'s name', login);
		// this.userRepository.createQueryBuilder('friends')
		let returned_user = await this.userRepository.findOneBy({login});
		const friend = await this.userRepository.findOneBy({ username: friend_username});
		// await this.userRepository.getConnection().
		// returned_user.friends.push(friend)
		// // // // friend.friends = [returned_user]
		// const neww = await this.userRepository.save(returned_user)
		// await this.userRepository.save(returned_user.friends)
		// await this.userRepository
		// .createQueryBuilder()
		// // .innerJoinAndSelect("photo.metadata", "metadata")
		// .relation(UserEntity, "friends")
		// .of(returned_user)
		// .add(friend)
		// console.log('here we go', returned_user.friends)
		// return (friend.friends)
		// if (!returned_user.friends)
		// 	returned_user.friends = []
		// await returned_user.friends.push(friend)
		// await this.userRepository.save(newU.friends)
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: returned_user.login,
			},
			relations: {
				friends: true,
			},
		})
		await loadedUser.friends.push(friend)
		await this.userRepository.save(loadedUser)
		// newU.friends.push(friend)
		return loadedUser
	}

	async get_friends(login: string)
	{
		const returned_user = await this.userRepository.findOneBy({login});
		// console.log(returned_user)
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: returned_user.login,
			},
			relations: {
				friends: true,
			},
		})
		return loadedUser
	}

	async get_user_by_username(username: string)
	{
		return await this.userRepository.findOneBy({username})
	}
	
	// async add_friend(login: string)
	// {

	// }

	async add_username(Login: string, newUsername: string) {
		const user = await this.userRepository.findOneBy({
			login: Login
		})
		const user_name_check = await this.userRepository.findOneBy({
			username: newUsername
		})
		if (user_name_check && user_name_check.username)
		{
			return false
		}
		console.log(newUsername)
		console.log(user.username)
		user.username = newUsername;
		await this.userRepository.save(user);
		return true
	}

	async GetUserData(Login: string) {
		return (await this.userRepository.findOneBy({
			login: Login
		}))
	}

	async delete_all() {
		this.userRepository.clear();
		console.log('deleted');
	}

	async sendConfirmedEmail(user: TfaUser) {
		const { email } = user
		await this.mailerService.sendMail({
			to: email,
			subject: 'Welcome to Nice App! Email Confirmed',
			template: 'confirmed',
			context: {
				email
			},
		});
	}

	async sendConfirmationEmail(email: string) {
		// const { email } = await user
		await this.mailerService.sendMail({
			from: 'source',
			to: email,
			subject: 'Welcome to Nice App! Confirm Email',
			template: 'confirm',
			context: {
				code: this.code
			},
		});
	}

	async signin(user: TfaUser, jwt?: JwtService): Promise<any> {
		try {
			const foundUser = await this.usertfaRepository.findOneBy({ email: user.email });
			if (foundUser) {
				if (foundUser.isVerified) {
					if (argon.verify(user.password, foundUser.password)) {
						const payload = { email: user.email };
						return {
							token: jwt.sign(payload),
						};
					}
				} else {
					return new HttpException('Please verify your account', HttpStatus.UNAUTHORIZED)
				}
				return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED)
			}
			return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED)
		} catch (e) {
			return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async verifyAccount(code: string): Promise<any> {
		try {
			const user = await this.usertfaRepository.findOneBy({ authConfirmToken: code });
			if (!user) {
				return new HttpException('Verification code has expired or not found', HttpStatus.UNAUTHORIZED)
			}
			await this.usertfaRepository.update({ authConfirmToken: user.authConfirmToken }, { isVerified: true, authConfirmToken: undefined })
			await this.sendConfirmedEmail(user)
			return true
		}
		catch (e) {
			return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

}
