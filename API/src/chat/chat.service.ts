import { Injectable } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import passport from 'passport';
import { relative } from 'path';
import { Repository } from 'typeorm';
import { Convo } from '../user/entities/conversation.entity';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Convo)
		private readonly convoRepository: Repository<Convo>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) { }

	async add_relations(owner: string, room_description: string) {
		console.log('name of the user|', owner, "|")
		const loadeduser = await this.userRepository.findOne({
			where: {
				username: owner
			},
			relations: {
				rooms: true
			}
		})
		const loadedroom = await this.convoRepository.findOne({
			where: {
				description: room_description
			},
			relations: {
				owner: true,
				administrators: true,
			}
		})
		loadedroom.administrators = [];
		loadedroom.administrators.push(loadeduser)
		loadedroom.owner = loadeduser
		console.log('before')
		this.convoRepository.save(loadedroom)
		if (!loadeduser.rooms)
			loadeduser.rooms = []
		loadeduser.rooms.push(loadedroom)
		this.userRepository.save(loadeduser)
		console.log('after')
	}

	async createRoom(data: any) {
		try {
			let new_room: Convo;
			const user = await this.userRepository.findOne({ where: { username: data.owner }, relations: { rooms: true } })
			const room = await this.convoRepository.create(new_room)
			room.description = data.description
			room.description = data.description
			room.password = data.password
			await this.convoRepository.save(room)
			await this.add_relations(data.owner, room.description)
			console.log('after2')
			// const loadedroom = await this.convoRepository.findOne({
			// 	where: {
			// 		description: room.description
			// 	},
			// 	relations: {
			// 		owner: true,
			// 		administrators: true
			// 	}
			// })
			// console.log(user)
			// if (!loadedroom.administrators)
			// 	loadedroom.administrators = []
			// loadedroom.administrators.push(user)
			// // console.log('this is the description', room.description)
			// loadedroom.owner = user
			// await this.convoRepository.save(loadedroom);
			// if (!user.rooms)
			// 	user.rooms = []
			// user.rooms.push(loadedroom)
			// console.log(room)
			return { status: true }
		}
		catch (err) {
			console.log(err)
			return { status: false }
		}
	}

	async get_room_descriptions() {
		const rooms = await this.convoRepository.find()
		let descriptions: string[] = []
		for (const k in rooms) {
			descriptions.push(rooms[k].description)
		}
		return descriptions
	}

	async block_user(blocked_username: string, current_username: string) {
		const blocked_user = await this.userRepository.findOneBy({ username: blocked_username })
		const user = await this.userRepository.findOne({
			where: {
				username: current_username
			},
			relations: { blocked: true }
		})
		user.blocked.push(blocked_user)
		await this.userRepository.save(user)
	}

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

	async get_rooms() {
		return (this.convoRepository.find(
			{ relations: { owner: true, administrators: true, banned: true, muted: true, messages: true } }
		))
	}
}
