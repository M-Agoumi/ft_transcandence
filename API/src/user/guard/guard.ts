import { AuthGuard } from "@nestjs/passport";

export class My_guard extends AuthGuard('42'){
	constructor(){
		super();
	}
}