import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getRepositoryToken, InjectRepository, } from '@nestjs/typeorm';
import { UserEntity } from './dto/user.entity';
import { Repository } from 'typeorm';
import { UserI } from './dto/user.interface';
import { from, map, Observable, switchMap } from 'rxjs';
import { bcrypt } from 'bcryptjs';


@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) {
	}

	create(newUser: UserI) {
		return (this.mailExists(newUser.email).pipe(
			switchMap((exists: boolean) => {
				if (!exists)
					return this.hashPassword(newUser.password).pipe(
						switchMap((hashedPasspord: string) => {
							newUser.password = hashedPasspord;
							return from(this.userRepository.save(newUser)).pipe(
								switchMap((user: UserI) => this.findOne(user.id))
							);
						}
						))
				else
					throw new HttpException('email aleady in use', HttpStatus.CONFLICT);

			})
		))

	}

	private hashPassword(password: string): Observable<string> {
		return from<string>(bcrypt.hash(password, 12));
	}

	private findOne(id: number) {
		return from(this.userRepository.findOneBy({ id }));
	}

	private mailExists(email: string) {
		return from(this.userRepository.findOneBy({ email })).pipe(
			map((user: UserI) => {
				if (user)
					return true
				return false;
			}))
	}
}
