import { registerEnumType } from '@nestjs/graphql';

export enum NoteStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

registerEnumType(NoteStatus, {
  name: 'NoteStatus',
  description: 'Processing status of the note',
});
