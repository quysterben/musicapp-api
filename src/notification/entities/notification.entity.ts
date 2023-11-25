import { User } from 'src/user/entities/user.entity'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  content: string

  @CreateDateColumn()
  created_at: Date

  @CreateDateColumn()
  updated_at: Date

  @ManyToOne(() => User, user => user.notifications)
  user: User
}
