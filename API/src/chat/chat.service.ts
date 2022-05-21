import { Injectable } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import passport from 'passport';
import { relative } from 'path';
import { Repository } from 'typeorm';
import * as argon from "argon2"
import { Convo } from '../user/entities/conversation.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Message } from 'src/user/entities/message.entity';
import { roomCreationDto } from 'src/user/dto/room_creation.dto';
import { passwordVerificationDto } from 'src/user/dto/password_verification.dto';
import { pushMsgDto } from 'src/user/dto/push_msg.dto';
import { usernameDto } from 'src/user/dto/username.dto';
import { descriptionDto } from 'src/user/dto/description.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Convo)
		private readonly convoRepository: Repository<Convo>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(Message)
		private readonly msgRepository: Repository<Message>,
	) { }

	async add_relations(data: any) {
		try {
			const loadeduser = await this.userRepository.findOneBy({
				username: data.owner
			}
			)
			const loadedroom = await this.convoRepository.findOne({
				where: {
					description: data.description
				},
				relations: {
					administrators: true,
				}
			})
			loadedroom.administrators = [loadeduser];
			return await this.convoRepository.save(loadedroom)
		}
		catch (err) {
			console.log(err)
		}
	}

	async add_password(password: string, description: string) {
		let room = await this.convoRepository.findOneBy({ description: description })
		if (!room) {
			console.log('room not found')
			return;
		}
		room.password = await argon.hash(password)
	}

	async room_has_password(room_description: string) {

		const room = await this.convoRepository.findOneBy({ description: room_description })
		if (room && room.password/*check for empty string later*/)
			return ({ status: true })
		return ({ status: false })
	}

	async verify_password(passwordverificationdto: passwordVerificationDto) {   /// room_description => description
		let verificarion: boolean = false;
		const room = await this.convoRepository.findOneBy({ description: passwordverificationdto.description })
		if (passwordverificationdto.password)
			verificarion = await argon.verify(room.password, passwordverificationdto.password)
		if (verificarion === true)
			return ({ status: true })
		return ({ status: false })
	}

	async joinRoom(userName: string, room_description: string) {
		try {
			const user = await this.userRepository.findOne({ where: { username: userName }, relations: { rooms: true } })
			const loadedRoom = await this.convoRepository.findOne({
				where: {
					description: room_description
				},
				relations: {
					users: true,
				}
			})
			if (!loadedRoom.users)
				loadedRoom.users = []
			loadedRoom.users.push(user)
			await this.convoRepository.save(loadedRoom)
			if (!user.rooms)
				user.rooms = []
			user.rooms.push(loadedRoom)
			await this.userRepository.save(user)
			return ({ status: 'end' })
		}
		catch (err) {
			console.log(err)
			return ({ status: 'something went wrong' })
		}
	}


	async pushMsg(pushmsgdto: pushMsgDto) {
		const loadedRoom = await this.convoRepository.findOne({
			where: {
				description: pushmsgdto.description
			},
			relations: {
				messages: true,
			}
		})
		const user = await this.userRepository.findOne({ where: { username: pushmsgdto.sender }, relations: { rooms: true } })
		let msg: any = { content: pushmsgdto.content, sender: user }
		const new_msg = await this.msgRepository.save(msg)
	}

	async leaveRoom(userName: string, room_description: string) {
		try {

			const user = await this.userRepository.findOne({
				where: { username: userName }, relations: {
					rooms: true
				}
			})
			const loadedRoom = await this.convoRepository.findOne({
				where: {
					description: room_description
				},
				relations: {
					users: true,
				}
			})
			let index = loadedRoom.users.findIndex(i => i.username === user.username)
			if (index > -1)
				loadedRoom.users.splice(index, 1)
			index = loadedRoom.administrators.findIndex(i => i.username === user.username)
			if (index > -1)
				loadedRoom.administrators.splice(index, 1)
			await this.convoRepository.save(loadedRoom)
			index = user.rooms.findIndex(room => room.description === loadedRoom.description)
			if (index > -1)
				user.rooms.splice(index, 1)
			await this.userRepository.save(user)
			return ({ status: 'end' })
		}
		catch (err) {
			//console.log(err)
			return ({ status: 'something went wrong' })
		}

	}

	async get_user_rooms(usernamedto: usernameDto) {
		let obj: { description: string, private: boolean } = { description: "", private: false }
		let arr: { description: string, private: boolean }[] = []
		let room_descriptions: string[] = []
		const loadeduser = await this.userRepository.findOne({ where: { username: usernamedto.username }, relations: { rooms: true } })
		for (const k in loadeduser.rooms) {
			obj = {
				description: loadeduser.rooms[k].description,
				private: loadeduser.rooms[k].private
			}
			arr.push(obj)
		}
		return arr
	}


	async createRoom(roomcreationdto: roomCreationDto) {    ///owner  => username
		try {
			if (roomcreationdto.description === "")
				return { status: 'empty description' }
			const user = await this.userRepository.findOne({ where: { username: roomcreationdto.username }, relations: { rooms: true } })
			let room: any = { description: roomcreationdto.description, password: "" };
			await this.convoRepository.save(room)
			const loadedroom = await this.convoRepository.findOne({
				where: {
					description: roomcreationdto.description
				},
				relations: {
					administrators: true,
					users: true,
					owner: true
				}
			})
			if (!loadedroom.administrators)
				loadedroom.administrators = []
			loadedroom.administrators.push(user)
			// if (!loadedroom.users)
			loadedroom.users = [user]
			loadedroom.owner = [user]
			loadedroom.private = roomcreationdto.mode
			if (roomcreationdto.password !== "") {
				loadedroom.password = await argon.hash(roomcreationdto.password)
			}
			//console.log('>>>>>>>>>', loadedroom, '<<<<<<<<<<<')
			await this.convoRepository.save(loadedroom)
			//console.log('after')
			if (!user.rooms)
				user.rooms = []
			user.rooms.push(loadedroom)
			await this.userRepository.save(user)
			return { status: 'success' }
		}
		catch (err) {
			//console.log(err)
			return { status: 'description already in use' }
		}
	}

	async get_room_descriptions() {
		let obj: { description: string, hasPass: boolean } = { description: "", hasPass: false }
		let arr: { description: string, hasPass: boolean }[] = []
		const rooms = await this.convoRepository.find()
		// let descriptions: string[] = []
		for (const k in rooms) {
			// //console.log(rooms[k])
			if (!rooms[k].private) {
				obj = {
					description: rooms[k].description,
					hasPass: false
				}
				if (rooms[k].password && rooms[k].password !== "")
					obj.hasPass = true
				arr.push(obj)
			}
			// descriptions.push(rooms[k].description)
		}
		return arr
	}

	async get_room_descriptions_private() {
		let obj: { description: string, hasPass: boolean } = { description: "", hasPass: false }
		let arr: { description: string, hasPass: boolean }[] = []
		const rooms = await this.convoRepository.find()
		// let descriptions: string[] = []
		for (const k in rooms) {
			if (rooms[k].private) {
				obj = {
					description: rooms[k].description,
					hasPass: false
				}
				if (rooms[k].password && rooms[k].password !== "")
					obj.hasPass = true
				arr.push(obj)
			}
			// descriptions.push(rooms[k].description)
		}
		return arr
	}

	async delete_all() {
		await this.convoRepository.clear()
	}


	// async block_user(blocked_username: string, current_username: string) {
	// 	const blocked_user = await this.userRepository.findOneBy({ username: blocked_username })
	// 	const user = await this.userRepository.findOne({
	// 		where: {
	// 			username: current_username
	// 		},
	// 		relations: { blocked: true }
	// 	})
	// 	user.blocked.push(blocked_user)
	// 	await this.userRepository.save(user)
	// }

	async set_new_password(room_description: string, new_pass: string) {
		const room = await this.convoRepository.findOne({
			where: {
				description: room_description
			}
		})
		room.password = new_pass
		this.convoRepository.save(room)
	}

	async remove_password(room_description: string) {
		const room = await this.convoRepository.findOne({
			where: {
				description: room_description
			}
		})
		room.password = undefined
		this.convoRepository.save(room)
	}

	async add_administrator(room_description: string, new_admin_username: string) {
		const room = await this.convoRepository.findOne({
			where: {
				description: room_description
			},
			relations: {
				administrators: true
			}
		})
		const new_admin = await this.userRepository.findOneBy({ username: new_admin_username })
		room.administrators.push(new_admin)
		this.convoRepository.save(room)
	}

	// async kickUser(room_description: string, kicked_username: string) {
	// 	const user = await this.userRepository.findOneBy({ username: kicked_username })
	// 	const room = await this.convoRepository.findOne({
	// 		where: {
	// 			description: room_description
	// 		},
	// 		relations: {
	// 			users: true
	// 		}
	// 	})
	// 	let index = room.users.findIndex(room_user => room_user.username === user.username)
	// 	if (index > -1)
	// 		room.users.splice

	// }

	async bann_user(room_description: string, banned_username: string) {
		const user = await this.userRepository.findOneBy({ username: banned_username })
		const room = await this.convoRepository.findOne({
			where: {
				description: room_description
			},
			relations: {
				banned: true
			}
		})
		this.leaveRoom(user.username, room_description)
		room.banned.push(user)
		this.convoRepository.save(room)
		let repo = this.convoRepository
		//console.log(room)
		setTimeout(function () {
			const index = room.banned.indexOf(user)
			if (index > -1)
				room.banned.splice(index, 1)
			repo.save(room)
			//console.log('end', room)
		}, 10000)
	}

	async remove_from_banned(user: UserEntity, convo: Convo) {
		const index = convo.banned.indexOf(user)
		if (index > -1)
			convo.banned.splice(index, 1)
	}

	async roomUsers(descriptiondto: descriptionDto) {
		let users: string[] = []
		console.log(descriptiondto);


		const room = await this.convoRepository.findOne({
			where: {
				description: descriptiondto.description
			},
			relations: {
				users: true
			}
		})
		if (room) {
			for (const k in room.users) {
				users.push(room.users[k].username)
			}
			return users
		}
		else
			return ['room not found']
	}

	async mute_user(room_description: string, muted_username: string) {
		const user = await this.userRepository.findOneBy({ username: muted_username })
		const room = await this.convoRepository.findOne({
			where: {
				description: room_description
			},
			relations: {
				muted: true
			}
		})
		room.muted.push(user)
		this.convoRepository.save(room)
	}

	async isPrivate(description: string) {
		const room = await this.convoRepository.findOneBy({ description: description })
		if (!room || !room.private)
			return { status: false }
		return { status: true }

	}

	async get_room_messages(description: string, current_user: string) {
		let obj: { message: string, sender: string }
		let arr: { message: string, sender: string }[]
		const user = await this.userRepository.findOne({
			where: {
				username: current_user
			},
			relations: {
				blocked: true
			}
		})
		const loadedRoom = await this.convoRepository.findOne({
			where: {
				description: description
			},
			relations: {
				messages: true
			}
		})
		for (const k in loadedRoom.messages) {
			obj.message = loadedRoom.messages[k].content
			obj.sender = loadedRoom.messages[k].sender
			let index = user.blocked.findIndex(u => u.username === obj.sender)
			if (index === -1)
				arr.push(obj)
		}
		return arr
	}

	async get_rooms() {
		return (this.convoRepository.find(
			{ relations: { administrators: true, users: true, banned: true, muted: true, messages: true, owner: true } }
		))
	}
}
