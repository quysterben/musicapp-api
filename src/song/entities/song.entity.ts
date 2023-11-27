import { User } from 'src/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  artwork: string

  @Column()
  artist: string

  @Column({ nullable: true, default: null })
  duration: number

  @Column()
  url: string

  @Column({ default: 0 })
  likes: number

  @CreateDateColumn()
  created_at: Date

  @CreateDateColumn()
  updated_at: Date

  @ManyToOne(() => User, user => user.songs)
  user: User

  @ManyToMany(() => User, user => user.favoriteSongs)
  likedUsers: User[]

  @ManyToMany(() => User, user => user.favoriteSongs)
  recentUsers: User[]
}
