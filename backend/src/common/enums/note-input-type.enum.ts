import { registerEnumType } from '@nestjs/graphql';

export enum NoteInputType {
  TEXT = 'text',
  AUDIO = 'audio',
}

registerEnumType(NoteInputType, {
  name: 'NoteInputType',
  description: 'The input method used to create the note',
});
