import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../../notes/entities/note.entity';

@ObjectType({ description: 'A mock patient record' })
@Entity('patients')
export class Patient {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ type: 'date' })
  dateOfBirth: string;

  @Field({ description: 'Medical Record Number' })
  @Column({ unique: true })
  mrn: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => Note,
    (note) => note.patient,
  )
  notes: Note[];

  // Computed helper — not exposed to GraphQL
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
