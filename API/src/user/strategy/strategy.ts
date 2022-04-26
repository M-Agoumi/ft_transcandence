// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { PassportStrategy } from "@nestjs/passport";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Strategy } from "passport";
// import { Repository } from 'typeorm';
// import { forty_two_strategy } from "passport-42";
// import { UserEntity } from "../dto/user.entity";


// @Injectable()
// export class Strategy_42 extends PassportStrategy(Strategy, '42') {
// 	constructor(config: ConfigService,
// 		@InjectRepository(UserEntity)
// 		private readonly userRepository: Repository<UserEntity>) {
// 		super({
// 			// jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			// secretOrKey: config.get('JWT_SECRET'),
// 		})
// 	}

// 	async validate(payload: {sub: number, email: string})
// 	{
// 		// console.log(payload)
// 		// const user = await this.prisma.user.findUnique({
// 		// 	where: {
// 		// 		id: payload.sub,
// 		// 		// email: payload.email
// 		// 	}
// 		// })
// 		const user = await this.userRepository.findOneBy({
// 				id: payload.sub,
// 		})
// 		// delete user.hash
// 		return (payload) 
// 	}
// }
import { Injectable, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class Strategy_42 extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FORTYTWO_CLIENT_ID'),
      clientSecret: configService.get<string>('FORTYTWO_CLIENT_SECRET'),
      callbackURL: 'http://10.11.100.84:3000/users/signup',
      passReqToCallback: true,
    });
  }

  async validate(
    request: { session: { accessToken: string } },
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ) {
    console.log(profile);
    request.session.accessToken = accessToken;
    console.log('accessToken', accessToken, 'refreshToken', refreshToken);
    // In this example, the user's 42 profile is supplied as the user
    // record.  In a production-quality application, the 42 profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
    // return (accessToken);
  }
}
