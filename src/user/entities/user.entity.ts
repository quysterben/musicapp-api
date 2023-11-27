import { Notification } from 'src/notification/entities/notification.entity'
import { Playlist } from 'src/playlist/entities/playlist.entity'
import { Song } from 'src/song/entities/song.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

export enum AccountType {
  Local = 'local',
  Google = 'google'
}

export enum Role {
  User = 'user',
  Admin = 'admin'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  first_name: string

  @Column()
  last_name: string

  @Column({ select: false })
  password: string

  @Column()
  email: string

  @Column({ nullable: true, default: null, select: false })
  refresh_token: string

  @Column({ nullable: true, default: null })
  avatar: string

  @Column({ default: Role.User })
  role: Role

  @Column({ default: AccountType.Local })
  account_type: AccountType

  @CreateDateColumn()
  created_at: Date

  @CreateDateColumn()
  updated_at: Date

  @OneToMany(() => Song, song => song.user)
  songs: Song[]

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[]

  @ManyToMany(() => Song, song => song.likedUsers)
  @JoinTable()
  favoriteSongs: Song[]

  @ManyToMany(() => Song, song => song.recentUsers)
  @JoinTable({
    name: 'user_recent_songs_song'
  })
  recentSongs: Song[]

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[]
}
