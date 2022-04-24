import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity()
export class UserStats {
	@Column()
	wins: number;

	@Column()
	losses: number;
	
	@Column()
	ladder_level: number;

	@Column()
	achievments: number;

}
