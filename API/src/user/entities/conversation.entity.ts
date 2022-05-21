import { JoinTable, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, Column, OneToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { UserEntity } from './user.entity'

@Entity()
export class Convo {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToMany(type => UserEntity)
	@JoinTable()
	owner: UserEntity[];

	@Column({ default: false, nullable: true })
	private: boolean

	@Column({ unique: true, nullable: true })
	description: string

	@Column({ nullable: true })
	password: string

	@ManyToMany(() => UserEntity)
	@JoinTable()
	administrators: UserEntity[];

	@ManyToMany(() => UserEntity)
	@JoinTable()
	users: UserEntity[];

	@ManyToMany(type => UserEntity)
	@JoinTable({ joinColumn: {} })
	banned: UserEntity[];

	@ManyToMany(type => UserEntity)
	@JoinTable({ joinColumn: {} })
	muted: UserEntity[];

	@ManyToMany(type => Message)
	@JoinTable({ joinColumn: {} })
	messages: Message[];

}
