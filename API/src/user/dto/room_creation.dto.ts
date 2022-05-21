import { IsBoolean, IsNotEmpty, IsString } from "class-validator";


export class roomCreationDto {

	@IsString()
	@IsNotEmpty()
	description: string

	@IsString()
	// @IsNotEmpty()
	password: string

	@IsString()
	@IsNotEmpty()
	username: string

	@IsBoolean()
	@IsNotEmpty()
	mode: boolean
}