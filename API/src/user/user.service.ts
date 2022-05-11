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
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios'
import { resolve } from 'path/posix';
import { rejects } from 'assert';
import { ConfigModule, ConfigService } from '@nestjs/config';
import AVatar from './entities/file.entity';
// import Mail from 'nodemailer';
import e, { response } from 'express';
import { createTransport } from 'nodemailer';
import { google } from 'googleapis';



@Injectable()
export class UserService {
	private code;
	private Transport
	private access_token
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private jwt: JwtService,
		private config: ConfigService,
		@InjectRepository(AVatar)
		private readonly avatarRepo: Repository<AVatar>,
		private readonly httpService: HttpService,
		private readonly mailerService: MailerService,

	) {}

	async sendMail(email: string) {
		const oauth2Client = new google.auth.OAuth2(this.config.get('CLIENT_ID'), this.config.get('CLIENT_SECRET'), this.config.get('REDIRECT_URL'))
		oauth2Client.setCredentials({ refresh_token: this.config.get('REFRESH_TOKEN') })
		this.access_token = oauth2Client.getAccessToken()
		this.Transport = createTransport({
			service: 'gmail',
			auth: {
				type: "OAuth2",
				user: 'arisssimane@gmail.com',
				clientId: this.config.get('CLIENT_ID'),
				clientSecret: this.config.get('CLIENT_SECRET'),
				refreshToken: this.config.get('REFRESH_TOKEN'),
				accessToken: this.access_token
				
			}
		})
		const mailOptions = {
			from: 'arisssimane@gmail.com',
			to: email,
			subject: "hello mom",
			text: 'is this working',
			html: 'is this working'
		}
		this.Transport.sendMail(mailOptions)
		// const result = await this.mailerService.sendMail(mailOptions)
		// const access_token = await oauth2Client.getAccessToken()
		// const transport = createTransport({
		// 	service: 'gmail',
		// 	auth: {
		// 		type: "OAuth2",
		// 		user: 'arisssimane@gmail.com',
		// 		clientId: this.config.get('CLIENT_ID'),
		// 		clientSecret: this.config.get('CLIENT_SECRET'),
		// 		refreshToken: this.config.get('REFRESH_TOKEN'),
		// 		accessToken: access_token

		// 	}
		// })
	}

	// public sendVerificationLink(email: string) {
	// 	const payload: VerificationTokenPayload = { email };
	// 	const token = this.jwt.sign(payload, {
	// 	  secret: this.config.get('JWT_VERIFICATION_TOKEN_SECRET'),
	// 	  expiresIn: `${this.config.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`
	// 	});
	 
	// 	const url = `${this.config.get('EMAIL_CONFIRMATION_URL')}?token=${token}`;
	 
	// 	const text = `Welcome to the application. To confirm the email address, click here: ${url}`;
	 
	// 	return this.emailService.sendMail({
	// 	  to: email,
	// 	  subject: 'Email confirmation',
	// 	  text,
	// 	})
	//   }



	async get_all_users() {

		return await this.userRepository.find({
			relations: {
				friends: true,
			},
		});
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

	async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
		const newFile = await this.avatarRepo.create({
			filename,
			data: dataBuffer
		})
		await this.avatarRepo.save(newFile)
		return newFile
	}

	async getFileByLogin(fileId: number) {
		const file = await this.avatarRepo.findOneBy({ id: fileId });
		// const file = await this.userRepository.findOneBy({login: "rel-hada"})
		// if (!file)
		// {
		// 	return {status : 'avatar not found'}
		// }
		return file

	}


	// async sendEmail(email: string) {
	// 	// await this.mailerService.sendMail({
	// 	// 	to: email,
	// 	// 	subject: 'A test email',

	// 	// })
	// 	// console.log(email)
	// 	try{

	// 		// let testAccount = await nodemailer.createTestAccount()
	// 		// let transporter = await nodemailer.createTransport({
	// 		// 	// service: 'Gmail',
	// 		// 	host: "smtp.ethereal.email",
	// 		// 	port: 2525,
	// 		// 	secure: false, // true for 465, false for other ports
	// 		// 	auth: {
	// 		// 	  user: testAccount.user, // generated ethereal user
	// 		// 	  pass: testAccount.pass, // generated ethereal password
	// 		// 	},
	// 		//   });

	// 		  // send mail with defined transport object
	// 		  console.log('123')
	// 		  let info = await this.mailerService.sendMail({
	// 			from: '"Fred Foo 👻" <foo@example.com>', // sender address
	// 			to: email, // list of receivers
	// 			subject: "Hello ✔", // Subject line
	// 			text: "Hello world?", // plain text body
	// 			html: "<b>Hello world?</b>", // html body
	// 		  });
	// 		  console.log('123')
	// 	}
	// 	catch(err)
	// 	{
	// 		console.log(err)
	// 	}

	// }

	async get_tk_li(code: string) {
		let token = "";
		let ret = {
			stats: true,
			login: "",
			username: ""
		}
		try {
			const data = await this.httpService.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "authorization_code",
				"client_id": process.env.FORTYTWO_CLIENT_ID,
				"client_secret": process.env.FORTYTWO_CLIENT_SECRET,
				"code": code,
				"redirect_uri": "http://10.11.100.91:4200/next"
			}).toPromise()
			const token = data.data.access_token;
			// console.log(">>>",token)
			const info = await this.httpService.get('https://api.intra.42.fr/v2/me', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}).toPromise()
			// fill user info to send to create
			let user = {} as UserI;
			user.login = info.data.login;
			ret.login = info.data.login
			// console.log('here is the data',info.data.login)
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
				// console.log('user here',user)
				if (!returned_user) {
					// user.logged_in = true
					console.log('here')
					await this.userRepository.save(user);
					// return ("")
				}
				else {
					// console.log('here2')
					ret.username = returned_user.username
					// console.log(user.access_token)
					// returned_user.access_token = user.access_token
					// for (const k in returned_user.friends) {
					// 	console.log(returned_user.friends[k])
					// 	ret.friends.push(returned_user.friends[k].username)
					// }
					// ret.username = returned_user.username
					// await this.userRepository.save(returned_user);
				}
				// return returned_user.username
			}
			catch (error) {
				ret.stats = false;
				console.log(error)
			}
			// ret.username = await this.create(user);
		}
		catch (error) {
			ret.stats = false;
			console.log('in3l2')
			return ret
		}
		// (ret.username === undefined || ret.username === null) ? ret.username = "": 0
		return (ret)
	}

	async check_if_token_valid(token: string) {
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
		catch (error) {
			// console.log(error)
			ret.stats = false
			return ret
		}
		return (ret)
	}


	async add_friend(login: string, friend_username: string) {
		const friend = await this.userRepository.findOneBy({ username: friend_username });
		if (!friend)
			return false
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: login,
			},
			relations: {
				friends: true,
			},
		})
		if (friend.login !== loadedUser.login)
			await loadedUser.friends.push(friend)

		await this.userRepository.save(loadedUser)
		return true
	}

	async get_friends(Login: string) {
		// const returned_user = await this.userRepository.findOneBy({login});
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: Login,
			},
			relations: {
				friends: true,
			},
		})
		// console.log(loadedUser)
		const friends: string[] = [];
		for (const k in loadedUser.friends) {
			// console.log(loadedUser.friends[k])
			friends.push(loadedUser.friends[k].username)
		}
		// console.log(friends)
		return friends
	}

	async get_user_by_username(userName: string) {
		const user = await this.userRepository.findOne({
			where: {
				username: userName
			}
		})
		if (user) {
			const ret = { username: user.username/*stats and shit later*/ }
			return ret
		}
		return {}
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
		// if (user_name_check && user_name_check.username)
		// {
		// 	return false
		// }
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

	// async sendConfirmedEmail(email: string) {
	// 	try {
	// 		// const { email } = user
	// 		await this.mailerService.sendMail({
	// 			to: email,
	// 			from: 'noreply@nestjs.com',
	// 			subject: 'Welcome to Nice App! Email Confirmed',
	// 			text: 'welcom666',
	// 			// template: 'confirmed',
	// 			// context: {
	// 			// 	email
	// 			// },
	// 		});
	// 	}
	// 	catch (err) {
	// 		console.log(err)
	// 	}
	// }

	// async sendConfirmationEmail(email: string) {
	// 	// const { email } = await user
	// 	await this.mailerService.sendMail({
	// 		from: 'source',
	// 		to: email,
	// 		subject: 'Welcome to Nice App! Confirm Email',
	// 		template: 'confirm',
	// 		context: {
	// 			code: this.code
	// 		},
	// 	});
	// }

	// async signin(user: TfaUser, jwt?: JwtService): Promise<any> {
	// 	try {
	// 		const foundUser = await this.usertfaRepository.findOneBy({ email: user.email });
	// 		if (foundUser) {
	// 			if (foundUser.isVerified) {
	// 				if (argon.verify(user.password, foundUser.password)) {
	// 					const payload = { email: user.email };
	// 					return {
	// 						token: jwt.sign(payload),
	// 					};
	// 				}
	// 			} else {
	// 				return new HttpException('Please verify your account', HttpStatus.UNAUTHORIZED)
	// 			}
	// 			return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED)
	// 		}
	// 		return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED)
	// 	} catch (e) {
	// 		return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
	// 	}
	// }

	// async verifyAccount(code: string): Promise<any> {
	// 	try {
	// 		const user = await this.usertfaRepository.findOneBy({ authConfirmToken: code });
	// 		if (!user) {
	// 			return new HttpException('Verification code has expired or not found', HttpStatus.UNAUTHORIZED)
	// 		}
	// 		await this.usertfaRepository.update({ authConfirmToken: user.authConfirmToken }, { isVerified: true, authConfirmToken: undefined })
	// 		await this.sendConfirmedEmail(user)
	// 		return true
	// 	}
	// 	catch (e) {
	// 		return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
	// 	}
	// }

}
