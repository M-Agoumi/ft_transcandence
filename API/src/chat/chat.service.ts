import { Injectable } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import passport from 'passport';
import { relative } from 'path';
import { Repository } from 'typeorm';
import * as argon from "argon2"
import { Convo } from '../user/entities/conversation.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Message } from 'src/user/entities/message.entity';

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

	async room_has_password(room_description: string) {
		console.log('1', room_description);

		const room = await this.convoRepository.findOneBy({ description: room_description })
		if (room && room.password/*check for empty string later*/)
			return ({ status: true })
		return ({ status: false })
	}

	async verify_password(password: string, room_description: string) {
		const room = await this.convoRepository.findOneBy({ description: room_description })
		const verificarion = await argon.verify(room.password, password)
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


	async pushMsg(content: string, sender: string, description: string) {
		const loadedRoom = await this.convoRepository.findOne({
			where: {
				description: description
			},
			relations: {
				messages: true,
			}
		})
		const user = await this.userRepository.findOne({ where: { username: sender }, relations: { rooms: true } })
		let msg: any = { content: content, sender: user }
		const new_msg = await this.msgRepository.save(msg)
		console.log(new_msg);

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
			console.log(loadedRoom.users);
			console.log(user);
			let index = loadedRoom.users.findIndex(i => i.username === user.username)
			console.log('index = |', index, '|')
			if (index > -1)
				loadedRoom.users.splice(index, 1)
			index = loadedRoom.administrators.findIndex(i => i.username === user.username)
			console.log('index = |', index, '|')
			if (index > -1)
				loadedRoom.administrators.splice(index, 1)
			await this.convoRepository.save(loadedRoom)
			index = user.rooms.findIndex(room => room.description === loadedRoom.description)
			console.log('index = |', index, '|')
			if (index > -1)
				user.rooms.splice(index, 1)
			await this.userRepository.save(user)
			return ({ status: 'end' })
		}
		catch (err) {
			console.log(err)
			return ({ status: 'something went wrong' })
		}

	}

	async get_user_rooms(data: any) {
		console.log('|', data.username, '|');

		let room_descriptions: string[] = []
		const loadeduser = await this.userRepository.findOne({ where: { username: data.username }, relations: { rooms: true } })
		for (const k in loadeduser.rooms) {
			room_descriptions.push(loadeduser.rooms[k].description)
		}
		return room_descriptions
	}


	async createRoom(data: any) {
		try {
			if (data.description === "")
				return { status: 'empty description' }
			const user = await this.userRepository.findOne({ where: { username: data.owner }, relations: { rooms: true } })
			let room: any = { description: data.description, password: "" };
			await this.convoRepository.save(room)
			const loadedroom = await this.convoRepository.findOne({
				where: {
					description: data.description
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
			if (!loadedroom.users)
				loadedroom.users = [user]
			loadedroom.owner = [user]
			loadedroom.private = data.mode
			if (data.password !== "") {
				loadedroom.password = await argon.hash(data.password)
			}
			console.log('>>>>>>>>>', loadedroom, '<<<<<<<<<<<')
			await this.convoRepository.save(loadedroom)
			console.log('after')
			if (!user.rooms)
				user.rooms = []
			user.rooms.push(loadedroom)
			await this.userRepository.save(user)
			return { status: 'success' }
		}
		catch (err) {
			console.log(err)
			return { status: 'description already in use' }
		}
	}

	async get_room_descriptions() {
		let obj: { description: string, hasPass: boolean } = { description: "", hasPass: false }
		let arr: { description: string, hasPass: boolean }[] = []
		const rooms = await this.convoRepository.find()
		// let descriptions: string[] = []
		for (const k in rooms) {
			// console.log(rooms[k])
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
	str = "str"

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
		room.banned.push(user)
		this.convoRepository.save(room)
		let repo = this.convoRepository
		console.log(room)
		setTimeout(function () {
			const index = room.banned.indexOf(user)
			if (index > -1)
				room.banned.splice(index, 1)
			repo.save(room)
			console.log('end', room)
		}, 10000)
	}

	async remove_from_banned(user: UserEntity, convo: Convo) {
		const index = convo.banned.indexOf(user)
		if (index > -1)
			convo.banned.splice(index, 1)
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
