import { ForbiddenException, Inject, Injectable, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
import { from, map, Observable, switchMap } from 'rxjs';
import { UserEntity } from 'src/user/dto/user.entity';
import { UserI } from 'src/user/dto/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class StrategyService extends PassportStrategy(Strategy, '42') {
	constructor(
		// private userservice: UserService,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly configService: ConfigService,) {
		super({
			clientID: configService.get<string>('FORTYTWO_CLIENT_ID'),
			clientSecret: configService.get<string>('FORTYTWO_CLIENT_SECRET'),
			callbackURL: 'http://10.11.100.84:3000/users/signup',
			passReqToCallback: true,
		}
		);
	}

	async validate(
		request: { session: { accessToken: string } },
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		cb: VerifyCallback,
	) {
		// console.log(profile);
		// request.session.accessToken = accessToken;
		// console.log('accessToken', accessToken, 'refreshToken', refreshToken);
		// In this example, the user's 42 profile is supplied as the user
		// record.  In a production-quality application, the 42 profile should
		// be associated with a user record in the application's database, which
		// allows for account linking and authentication with other identity
		// providers.
		const user: UserI = {
			login: profile._json.login
		}
		this.create(user);

		return cb(null, profile);
		// return (accessToken);
	}

	async create(newUser: UserI) {
		try {
			await this.loginExists(newUser.login).pipe(
				switchMap((exists: boolean): Observable<boolean> => {
					if (!exists) {
						///save user
						const user = this.userRepository.save(newUser);
						console.log('user created');
					}
					let some: Observable<boolean>;
					return (some);
				})
			)
			// const user = this.userRepository.save(newUser);
		}
		catch (error) {
			if (/*error instanceof PrismaClientKnownRequestError && */error.code === 'P2002') {
				throw new ForbiddenException('Credentials Taken')
			}
		}
	}

	private loginExists(login: string) {
		return from(this.userRepository.findOneBy({ login })).pipe(
			map((user: UserI) => {
				if (user)
					return true
				return false;
			}))
	}
}
