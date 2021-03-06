import { Injectable } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserI } from './dto/user.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import AVatar from './entities/file.entity';
import { createTransport } from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { ChatService } from 'src/chat/chat.service';
import { Convo } from '../chat/entities/conversation.entity';



@Injectable()
export class UserService {
	private code;
	private Transport
	private access_token
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(Convo)
		private readonly convoRepository: Repository<Convo>,
		private jwt: JwtService,
		private config: ConfigService,
		@InjectRepository(AVatar)
		private readonly avatarRepo: Repository<AVatar>,
		private readonly httpService: HttpService,
		private chatservice: ChatService

	) { }

	async sendMail(mailOptions: any) {
		const oauth2Client = new OAuth2Client(this.config.get('CLIENT_ID'), this.config.get('CLIENT_SECRET'), this.config.get('REDIRECT_URL'))
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
		this.Transport.sendMail(mailOptions)
	}

	async enableTwoFa(email: string, userName: string) {
		const user = await this.userRepository.findOneBy({ username: userName })
		if (!user)
			return (false)
		user.email = email
		user.twoFaActivated = true
		await this.userRepository.save(user)
		return (true)
	}

	async disableTwoFa(userName: string) {
		const user = await this.userRepository.findOneBy({ username: userName })
		if (!user)
			return (false)
		user.twoFaActivated = false
		user.isEmailConfirmed = false
		await this.userRepository.save(user)
		return (true)
	}

	async sendVerificationLink(Email: string, username: string) {
		const payload: { username: string } = { username: username };
		const token = await this.jwt.sign(payload, {
			secret: this.config.get('JWT2FA_VERIFICATION_TOKEN_SECRET'),
			expiresIn: `${this.config.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`
		});

		const url = `${this.config.get('EMAIL_CONFIRMATION_URL')}?token=${token}`;

		const text = `Welcome to Ping Pong. To confirm the email address, click here: ${url}`;
		return this.sendMail({
			to: Email,
			subject: 'Email confirmation',
			text,
		})
	}

	async decodeConfirmationToken(token: string) {
		try {
			const payload = await this.jwt.verify(token, {
				secret: this.config.get('JWT2FA_VERIFICATION_TOKEN_SECRET'),
			});

			console.log(payload)
			if (typeof payload === 'object' && 'username' in payload) {
				return payload.username;
			}
			//console.log('error')
		} catch (error) {
			if (error?.name === 'TokenExpiredError') {
				//console.log('token expired')
			}
		}
	}

	async confirmEmail(username: string) {
		if (!username)
			return ({ status: 'token expired' });

		const user = await this.userRepository.findOneBy({ username: username });
		if (!user)
			return ({ status: 'token expired' });
		//console.log('>>>>>>>', user, '<<<<<<<<')
		if (user.isEmailConfirmed) {
			//console.log('email already confirmed')
			return ({ status: 'already confirmed' });
		}
		user.isEmailConfirmed = true
		this.userRepository.save(user)
		return ({ status: 'si' })
	}

	/////////////////////////
	/////////FRIENDS/////////
	/////////////////////////

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


	async get_all_users() {

		return await this.userRepository.find({
			relations: {
				friends: true,
				rooms: true,
				blocked: true
			},
		});
	}

	async blocked_list(username: string) {
		let blocked: string[] = []
		const user = await this.userRepository.findOne({
			where: {
				username: username
			},
			relations: {
				blocked: true
			}
		})
		for (const k in user.blocked) {
			blocked.push(user.blocked[k].username)
		}
		return blocked
	}

	async remove_user(user: LoginUserDto) {
		const login = user.login;
		const to_be_removed = await this.userRepository.findOneBy({ login })
		if (to_be_removed) {
			//console.log(`removing ${to_be_removed.username}`)
			await this.userRepository.remove(to_be_removed);
			//console.log(`removed`)
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

	async getFileById(fileId: number) {
		const file = await this.avatarRepo.findOneBy({ id: fileId });
		return file

	}

	async get_tk_li(code: string) {
		let token = "";
		let ret = {
			stats: true,
			login: "",
			username: "",
			twoFa: false
		}
		try {
			console.log(code)
			const data = await this.httpService.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "authorization_code",
				"client_id": process.env.FORTYTWO_CLIENT_ID,
				"client_secret": process.env.FORTYTWO_CLIENT_SECRET,
				"code": code,
				"redirect_uri": "http://10.11.100.42:4200/next"
			}).toPromise()
			const token = data.data.access_token;
			const info = await this.httpService.get('https://api.intra.42.fr/v2/me', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}).toPromise()
			// fill user info to send to create
			let user = {} as UserI;
			user.login = info.data.login;
			ret.login = info.data.login
			/////moving create
			try {
				const returned_user = await this.userRepository.findOne({
					where: {
						login: user.login
					},
					relations: {
						friends: true,
					},
				})
				if (!returned_user) {
					// //console.log('here')
					await this.userRepository.save(user);
				}
				else {
					ret.username = returned_user.username
					ret.twoFa = returned_user.twoFaActivated
				}
			}
			catch (error) {
				ret.stats = false;
				console.log(error)
				//console.log('in3l1')
			}
		}
		catch (error) {
			ret.stats = false;
			console.log('in3l2')
			return ret
		}
		// (ret.username === undefined || ret.username === null) ? ret.username = "": 0
		return (ret)
	}

	async block_user(blocked_username: string, current_username: string) {
		try {
			const blocked_user = await this.userRepository.findOneBy({ username: blocked_username })
			const user = await this.userRepository.findOne({
				where: {
					username: current_username
				},
				relations: { blocked: true, friends: true }
			})
			user.blocked.push(blocked_user)
			this.removeFriend(blocked_user.username, current_username)
			await this.userRepository.save(user)
			return { status: true }
		}
		catch {
			return { status: false }
		}
	}

	async unblock_user(blocked_username: string, current_username: string) {
		try {
			const blocked_user = await this.userRepository.findOneBy({ username: blocked_username })
			const user = await this.userRepository.findOne({
				where: {
					username: current_username
				},
				relations: { blocked: true }
			})
			console.log(user)
			let index = user.blocked.findIndex(user => user.username === blocked_user.username)
			if (index > -1)
				user.blocked.splice(index, 1)
			await this.userRepository.save(user)
			return { status: true }
		}
		catch {
			return { status: false }
		}
	}

	async removeFriend(removed_friend: string, current_username: string) {
		try {
			const friend = await this.userRepository.findOne({
				where: {
					username: removed_friend,
				},
				relations: {
					friends: true,
				},
			})
			if (!friend)
				return false
			const loadedUser = await this.userRepository.findOne({
				where: {
					username: current_username,
				},
				relations: {
					friends: true,
				},
			})
			if (friend.login !== loadedUser.login) {
				let index = loadedUser.friends.findIndex(friend => friend.username === friend.username)
				if (index > -1)
					loadedUser.friends.splice(index, 1)
				index = friend.friends.findIndex(user => user.username === loadedUser.username)
				if (index > -1)
					friend.friends.splice(index, 1)
			}
			let room = await this.convoRepository.findOne({
				where: {
					description: `${current_username}-${removed_friend}`
				},
				relations: {
					messages: true
				}
			})
			if (!room) {

				room = await this.convoRepository.findOne({
					where: {
						description: `${removed_friend}-${current_username}`
					},
					relations: {
						messages: true
					}
				})
			}
			await this.convoRepository.remove(room)
			await this.userRepository.save(loadedUser)
			await this.userRepository.save(friend)
			return { status: true }
		}
		catch {
			return { status: false }
		}
	}


	async add_friend(login: string, friend_username: string) {
		const friend = await this.userRepository.findOne({
			where: {
				username: friend_username,
			},
			relations: {
				friends: true,
				blocked: true
			},
		})
		if (!friend)
			return false
		const loadedUser = await this.userRepository.findOne({
			where: {
				login: login,
			},
			relations: {
				friends: true,
				blocked: true
			},
		})
		let index
		if (loadedUser.blocked) {
			index = loadedUser.blocked.findIndex(user => user.username === friend.username)
			if (index !== -1)
				return { status: 'false' }
		}
		if (friend.blocked) {
			index = friend.blocked.findIndex(user => user.username === loadedUser.username)
			if (index !== -1)
				return { status: 'false' }
		}
		await this.chatservice.createDm(loadedUser.username, friend_username)
		if (friend.login !== loadedUser.login) {
			await loadedUser.friends.push(friend)
			await friend.friends.push(loadedUser)
		}
		await this.userRepository.save(loadedUser)
		await this.userRepository.save(friend)
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
		const friends: string[] = [];
		for (const k in loadedUser.friends) {
			friends.push(loadedUser.friends[k].username)
		}
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

	async GetUserData(Login: string) {
		return (await this.userRepository.findOneBy({
			login: Login
		}))
	}

	async delete_all() {
		this.userRepository.clear();
		//console.log('deleted');
	}

	async get_history(userName: string) {
		const user = this.userRepository.findOneBy({ username: userName })
	}

	async get_stats(Login: string) {
		const user = await this.userRepository.findOne({
			where: {
				login: Login
			},
			relations: {
				userstats: true,
			},
		})
		return ({ stats: user.userstats })
	}


}
