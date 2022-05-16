import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { My_guard } from 'src/guard';
import { ChatService } from './chat.service';


// @UseGuards(My_guard)
@Controller('chat')
export class ChatController {
	constructor(private chatservice: ChatService) { }
	@Post('createRoom')
	async createRoom(@Body() data: any) {
		// console.log(data)
		await this.chatservice.createRoom(data)
		console.log('after3')

	}

	@Post('all')
	get_all(ownerUsername: string) {
		return this.chatservice.get_rooms()
	}

	@Post('bann')
	test() {
		this.chatservice.bann_user('room 7', 'imane')
	}

	@Get('descriptions')
	async get_descriptions() {
		return await this.chatservice.get_room_descriptions();
	}

}
