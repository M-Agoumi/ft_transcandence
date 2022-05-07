import { ForbiddenException, Global, HttpException, HttpStatus, Injectable, Post } from '@nestjs/common';
import { getConnectionName, getRepositoryToken, InjectRepository, } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserI } from './dto/user.interface';
import { from, map, Observable, switchMap } from 'rxjs';
import { bcrypt } from 'bcryptjs';
import * as argon from "argon2"
import { stringify } from 'querystring';
import { LoginUserDto } from './dto/login-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { TfaUser } from 'src/2FA/user.2fa.entity';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios'
import { resolve } from 'path/posix';
import { rejects } from 'assert';
import { ConfigModule, ConfigService } from '@nestjs/config';
import AVatar from './entities/file.entity';


@Injectable()
export class UserService {
	private code;
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private jwt: JwtService,
		private mailerService: MailerService,
		@InjectRepository(TfaUser) private usertfaRepository: Repository<TfaUser>,
		private config: ConfigService,
		@InjectRepository(AVatar)
		private readonly avatarRepo: Repository<AVatar>,
		private readonly httpService: HttpService,
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


	/// avatar shit ///

	async uploadDatabaseFile(dataBuffer: Buffer, filename: string)
	{
		const newFile = await this.avatarRepo.create({
			filename,
			data: dataBuffer
		})
		await this.avatarRepo.save(newFile)
		return newFile
	}

	async getFileByLogin(fileId: number)
	{
		// const file = await this.avatarRepo.findOneBy({id: fileId});
		const file = await this.userRepository.findOneBy({login: "iariss"})
		// if (!file)
		// {
		// 	return {status : 'avatar not found'}
		// }
		return file.avatar
		// const user = await this.userRepository.findOneBy({login})
		// return (user.avatar.data)

	}

	async addAvatar(Login: string, imageBuffer: Buffer, filename: string)
	{
		// console.log('here')
		const user = await this.userRepository.findOne(
			{
				where: {
					login: Login
				},
				relations: {
					avatar : true,
				},
				
				
			})
		// console.log('here1')
		const avatar = await this.uploadDatabaseFile(imageBuffer, filename);
		// console.log('here2')
		// await this.userRepository.update(user.login, {
		// 	avatarId: avatar.id
		// })
		user.avatarId = avatar.id;
		await this.userRepository.save(user)
		console.log(user.avatar.data, "| => |", user.avatarId)
		return (avatar)
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
			// stats: true,
			username: "",
			// friends: []
		}
		try {
			const data = await this.httpService.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "authorization_code",
				"client_id": process.env.FORTYTWO_CLIENT_ID,
				"client_secret": process.env.FORTYTWO_CLIENT_SECRET,
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
			let user = {} as UserEntity;
			user.login = info.data.login;
			user.access_token = ret.token;
			/////moving create
			try {
				// const login = newUser.login;
				const returned_user = await this.userRepository.findOne({
					where: {
						login: user.login
					},
					relations: {
						friends: true,
					},
				})
				if (!returned_user)
				{
					// user.logged_in = true
					await this.userRepository.save(user);
					// return ("")
				}
				else
				{
					// console.log(user.access_token)
					returned_user.access_token = user.access_token
					// for (const k in returned_user.friends) {
					// 	console.log(returned_user.friends[k])
					// 	ret.friends.push(returned_user.friends[k].username)
					// }
					ret.username = returned_user.username
					await this.userRepository.save(returned_user);
				}
				// return returned_user.username
			}
			catch (error) {
				console.log('in3l')
			}
			// ret.username = await this.create(user);
		}
		catch (error) {
			// ret.stats = false;
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

	// async create(newUser: UserI) {
	// 	try {
	// 		// const login = newUser.login;
	// 		const returned_user = await this.userRepository.findOne({
	// 			where: {
	// 				login: newUser.login
	// 			},
	// 			relations: {
	// 				friends: true,
	// 			},
	// 		})
	// 		if (!returned_user)
	// 		{
	// 			newUser.logged_in = true
	// 			await this.userRepository.save(newUser);
	// 			return ("")
	// 		}
	// 		else
	// 		{
	// 			console.log(newUser.access_token)
	// 			returned_user.access_token = newUser.access_token
	// 			await this.userRepository.save(returned_user);
	// 		}
	// 		return returned_user.username
	// 	}
	// 	catch (error) {
	// 		console.log('in3l')
	// 	}
	// 	console.log('------------------------------------------------------------------------------------')
	// 	console.log('here 1',(await this.userRepository.manager.find(UserEntity)))
	// 	console.log('------------------------------------------------------------------------------------')
	// }


	async add_friend(login: string, friend_username:string)
	{
		const friend = await this.userRepository.findOneBy({ username: friend_username});
		if (!friend)
			return {status:'friend not found'}
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: login,
			},
			relations: {
				friends: true,
			},
		})

		await loadedUser.friends.push(friend)

		await this.userRepository.save(loadedUser)
		return {status:'si'}
	}

	async get_friends(login: string)
	{
		// const returned_user = await this.userRepository.findOneBy({login});
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: login,
			},
			relations: {
				friends: true,
			},
		})
		const friends = [];
		for (const k in loadedUser.friends) {
			console.log(loadedUser.friends[k])
			friends.push(loadedUser.friends[k].username)
		}
		return friends
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
