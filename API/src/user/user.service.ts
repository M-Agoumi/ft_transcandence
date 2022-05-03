import { ForbiddenException, Global, HttpException, HttpStatus, Injectable, Post } from '@nestjs/common';
import { getRepositoryToken, InjectRepository, } from '@nestjs/typeorm';
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
			login: "",
			token: "",
			stats: true
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
			ret.login = info.data.login;
			// fill user info to send to create
			let user = {} as UserI;
			user.login = ret.login;
			user.access_token = ret.token;
			await this.create(user);
		}
		catch (error) {
			console.log(error)
			ret.stats = false;
			return ret
		}
		return (ret)
	}

	async create(newUser: UserI) {
		try {
			// await this.loginExists(newUser.login).pipe(
			// 	switchMap((exists: boolean): Observable<boolean> => {
			// 		if (!exists) {
			// 			///save user
			// 			this.userRepository.save(newUser);
			// 			console.log('user created');
			// 		}
			// 		let some: Observable<boolean>;
			// 		return (some);
			// 	})
			// )
			// const user = {} as U;
			const login = newUser.login;
			const returned_user = this.userRepository.findOneBy({login});
			// console.log('here ', returned_user[login]);
			if (!returned_user[login])
			{
				await this.userRepository.save(newUser);
				// console.log('here');
			}
		}
		catch (error) {
			if (/*error instanceof PrismaClientKnownRequestError && */error.code === 'P2002') {
				throw new ForbiddenException('Credentials Taken')
			}
		}
		console.log('------------------------------------------------------------------------------------')
		// console.log(newUser);
		console.log((await this.userRepository.manager.find(UserEntity)))
		console.log('------------------------------------------------------------------------------------')
	}

	// private loginExists(login: string) {
	// 	return from(this.userRepository.findOneBy({ login })).pipe(
	// 		map((user: UserI) => {
	// 			if (user) {
	// 				return true
	// 			}
	// 			return false;
	// 		}))
	// }

	// async create(newUser: UserI) {
	// 	try {
	// 		await this.mailExists(newUser.login).pipe(
	// 			switchMap((exists: boolean): Observable<boolean> => {
	// 				if (exists) {
	// 					this.usernameExists(newUser.login).pipe(
	// 						switchMap((nameExists: boolean): Observable<boolean> => {
	// 							if (nameExists)
	// 								console.log('user already logged in');
	// 							else
	// 								console.log('user must add username');
	// 							let some: Observable<boolean>;
	// 							return (some);
	// 						})
	// 					)
	// 				}
	// 				else {
	// 					const user = this.userRepository.save(newUser);
	// 					console.log('user created but must add username');
	// 				}
	// 				let some: Observable<boolean>;
	// 				return (some);
	// 			})
	// 		)
	// 		///save user
	// 		// const user = this.userRepository.save(newUser);
	// 	}
	// 	catch (error) {
	// 		if (/*error instanceof PrismaClientKnownRequestError && */error.code === 'P2002') {
	// 			throw new ForbiddenException('Credentials Taken')
	// 		}
	// 	}
	// }



	// private hashPassword(password: string): Observable<string> {
	// 	return from<string>(bcrypt.hash(password, 12));
	// }

	async add_username(Login: string, newUsername: string) {
		const user = await this.userRepository.findOneBy({
			login: Login
		})
		user.username = newUsername;
		await this.userRepository.save(user);
	}

	async GetUserData(Login: string) {
		return (await this.userRepository.findOneBy({
			login: Login
		}))
	}

	// private findOne(Login: string) {
	// 	return from(this.userRepository.findOneBy({login: Login}));
	// }

	// private mailExists(login: string) {
	// 	return from(this.userRepository.findOneBy({ login })).pipe(
	// 		map((user: UserI) => {
	// 			if (user)
	// 				return true
	// 			return false;
	// 		}))
	// }

	// private usernameExists(login: string) {
	// 	return from(this.userRepository.findOneBy({ login })).pipe(
	// 		map((user: UserI) => {
	// 			if (user.username)
	// 				return true
	// 			return false;
	// 		}))
	// }

	// async login(user: LoginUserDto)
	// {
	// 	const email = user.email;
	// 	const returned_user = await this.userRepository.findOneBy({email})
	// 	if (!returned_user) throw new ForbiddenException('Credentials icorrect')
	// 	console.log(user.password)
	// 	const pwMatches = await argon.verify(returned_user.password, user.password);
	// 	if (!pwMatches) throw new ForbiddenException('Credentials icorrect')
	// 	console.log('logged in');
	// 	// returned_user.password = "";
	// 	return returned_user
	// }
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

	// async signup(user: TfaUser): Promise<any> {
	// 	try {
	// 		//    const salt = await bcrypt.genSalt();
	// 		const hash = await argon.hash(user.password);
	// 		const reqBody = {
	// 			email: user.email,
	// 			password: hash,
	// 			authConfirmToken: this.code,
	// 		}
	// 		const newUser = this.usertfaRepository.insert(reqBody);
	// 		await this.sendConfirmationEmail(reqBody);
	// 		return true
	// 	} catch (e) {
	// 		return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
	// 	}
	// }

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
