import { AuthGuard } from "@nestjs/passport";

export class JtwGuard extends AuthGuard('jwt'){
	constructor(){
		super();
	}
}