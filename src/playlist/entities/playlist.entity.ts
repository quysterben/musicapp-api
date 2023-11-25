import { Song } from 'src/song/entities/song.entity'
import { User } from 'src/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  thumbnail: string

  @Column({ default: false })
  is_public: boolean

  @CreateDateColumn()
  created_at: Date

  @CreateDateColumn()
  updated_at: Date

  @ManyToMany(() => Song)
  @JoinTable()
  songs: Song[]

  @ManyToOne(() => User, user => user.playlists)
  user: User
}
