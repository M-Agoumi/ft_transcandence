import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { My_guard } from 'src/guard';
import { GetUser } from 'src/user/decorators';
import { chatOpDto } from 'src/user/dto/chat_op.dto';
import { descriptionDto } from 'src/user/dto/description.dto';
import { passwordVerificationDto } from 'src/user/dto/password_verification.dto';
import { pushMsgDto } from 'src/user/dto/push_msg.dto';
import { roomCreationDto } from 'src/user/dto/room_creation.dto';
import { usernameDto } from 'src/user/dto/username.dto';
import { ChatService } from './chat.service';


@UseGuards(My_guard)
@Controller('chat')
export class ChatController {
	constructor(private chatservice: ChatService) { }
	@Post('createRoom')
	async createRoom(@Body() roomcreationdto: roomCreationDto, @GetUser() user: any) {
		try {
			return await this.chatservice.createRoom(roomcreationdto, user.username)
		}
		catch (err) {
			//console.log(roomcreationdto)
		}
	}

	@Post('all')
	get_all() {
		return this.chatservice.get_rooms()
	}

	@Post('hasPass')
	async has_pass(@Body() descriptiondto: descriptionDto) {
		return await this.chatservice.room_has_password(descriptiondto.description)
	}

	@Post('verify_password')
	async verify_password(@Body() passwordverificationdto: passwordVerificationDto) {
		//console.log(passwordverificationdto)
		return await this.chatservice.verify_password(passwordverificationdto)
	}

	@Post('joinRoom')
	async joinRoom(@Body() descriptiondto: descriptionDto, @GetUser() user: any) {
		// console.log(chatopdto)
		return await this.chatservice.joinRoom(user.username, descriptiondto.description)
	}

	@Post('leaveRoom')
	async leaveRoom(@Body() descriptiondto: descriptionDto, @GetUser() user: any) {
		return await this.chatservice.leaveRoom(user.username, descriptiondto.description)
	}


	@Post('pushMsg')
	async pushMsg(@Body() pushmsgdto: pushMsgDto) {
		// console.log(pushmsgdto)
		return await this.chatservice.pushMsg(pushmsgdto);
	}

	@Post('isPrivate')
	async isPrivate(@Body() descriptiondto: descriptionDto) {
		//console.log(descriptiondto)
		return await this.chatservice.isPrivate(descriptiondto.description);
	}

	@Post('my_rooms')
	async get_room_descriptions(@GetUser() user: any) {
		//console.log(usernamedto)
		return await this.chatservice.get_user_rooms(user.username);
	}

	@Post('roomUsers')
	async roomUsers(@Body() descriptiondto: descriptionDto) {
		//console.log(usernamedto)
		return await this.chatservice.roomUsers(descriptiondto);
	}

	@Post('roomMsgs')
	async roomMsgs(@GetUser() user: any, @Body() descriptiondto: descriptionDto) {
		//console.log(usernamedto)
		return await this.chatservice.get_room_messages(descriptiondto.description, user.username);
	}

	@Get('descriptions')
	async get_descriptions() {
		return await this.chatservice.get_room_descriptions();
	}

	// @Post('delete')
	// async delete() {
	// 	await this.chatservice.delete_all();
	// }

	@Get('descriptions/private')
	async get_descriptions_private() {
		return await this.chatservice.get_room_descriptions_private();
	}

}
