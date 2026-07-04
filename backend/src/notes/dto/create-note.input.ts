import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NoteInputType } from '../../common/enums/note-input-type.enum';

@InputType()
export class CreateNoteInput {
  @Field(() => ID, { description: 'ID of the patient this note belongs to' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @Field(() => NoteInputType, {
    description: 'Whether the note is from typed text or an audio file',
  })
  @IsEnum(NoteInputType)
  inputType: NoteInputType;

  @Field({ nullable: true, description: 'Free text content (required for TEXT input type)' })
  @IsOptional()
  @IsString()
  rawText?: string;
}
