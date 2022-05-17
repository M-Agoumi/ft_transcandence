import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { My_guard } from 'src/guard';
import { ChatService } from './chat.service';


// @UseGuards(My_guard)
@Controller('chat')
export class ChatController {
	constructor(private chatservice: ChatService) { }
	@Post('createRoom')
	async createRoom(@Body() data: any) {
		try {
			return await this.chatservice.createRoom(data)
			console.log('after3')
		}
		catch (err) {
			console.log(data)
		}
	}
	@Post('createRoom1')
	async testo(@Body() data: any) {
		try {
			return await this.chatservice.add_relations(data)
			console.log('after3')
		}
		catch (err) {
			console.log(data)
		}
	}

	@Post('all')
	get_all(ownerUsername: string) {
		return this.chatservice.get_rooms()
	}

	@Post('hasPass')
	async has_pass(@Body() data: any) {
		return await this.chatservice.room_has_password(data.description)
	}

	@Post('verify_password')
	async verify_password(@Body() data: any) {
		return await this.chatservice.verify_password(data.password, data.description)
	}

	@Post('joinRoom')
	async joinRoom(@Body() data: any) {
		return await this.chatservice.joinRoom(data.username, data.description)
	}

	@Post('leaveRoom')
	async leaveRoom(@Body() data: any) {
		return await this.chatservice.leaveRoom(data.username, data.description)
	}

	// @Post('bann')
	// test() {
	// 	this.chatservice.bann_user('room 7', 'imane')
	// }


	@Get('my_rooms')
	async get_room_descriptions(@Body() data: any) {
		console.log(data)
		return await this.chatservice.get_user_rooms(data);
	}

	@Get('descriptions')
	async get_descriptions() {
		return await this.chatservice.get_room_descriptions();
	}

}
