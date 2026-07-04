import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NoteInputType } from '../../common/enums/note-input-type.enum';
import { NoteStatus } from '../../common/enums/note-status.enum';
import { Patient } from '../../patients/entities/patient.entity';

@ObjectType({ description: 'A clinical note associated with a patient' })
@Entity('notes')
export class Note {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  patientId: string;

  @Field(() => Patient, { nullable: true })
  @ManyToOne(
    () => Patient,
    (patient) => patient.notes,
    { eager: true },
  )
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Field(() => NoteInputType)
  @Column({ type: 'enum', enum: NoteInputType })
  inputType: NoteInputType;

  @Field({ nullable: true, description: 'Original typed text (text input)' })
  @Column({ type: 'text', nullable: true })
  rawText?: string;

  @Field({ nullable: true, description: 'Path or URL to the uploaded audio file' })
  @Column({ nullable: true })
  audioFilePath?: string;

  @Field({ nullable: true, description: 'Audio transcription from Gemini' })
  @Column({ type: 'text', nullable: true })
  transcribedText?: string;

  @Field({ nullable: true, description: 'SOAP-format clinical summary from Gemini' })
  @Column({ type: 'text', nullable: true })
  soapSummary?: string;

  @Field(() => NoteStatus)
  @Column({
    type: 'enum',
    enum: NoteStatus,
    default: NoteStatus.PROCESSING,
  })
  status: NoteStatus;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
