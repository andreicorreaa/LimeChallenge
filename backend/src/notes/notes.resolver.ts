import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import type { FileUpload } from '../common/types/file-upload.type';
import type { CreateNoteInput } from './dto/create-note.input';
import { Note } from './entities/note.entity';
import type { NotesService } from './notes.service';

@Resolver(() => Note)
export class NotesResolver {
  constructor(private readonly notesService: NotesService) {}

  // ─── Queries (no rate limiting on reads) ─────────────────────────────────

  @SkipThrottle()
  @Query(() => [Note], { name: 'notes', description: 'List all notes' })
  findAll(): Promise<Note[]> {
    return this.notesService.findAll();
  }

  @SkipThrottle()
  @Query(() => Note, {
    name: 'note',
    description: 'Get a single note by ID',
    nullable: true,
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Note> {
    return this.notesService.findOne(id);
  }

  // ─── Mutations (rate limited) ─────────────────────────────────────────────

  /**
   * Create a note — 20 requests / 60 sec per IP.
   * The audioFile argument uses the Upload scalar from graphql-upload.
   */
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Mutation(() => Note, {
    name: 'createNote',
    description: 'Create a clinical note (text or audio upload)',
  })
  createNote(
    @Args('input') input: CreateNoteInput,
    @Args('audioFile', {
      type: () => GraphQLUpload,
      nullable: true,
      description: 'Audio file upload (required when inputType = AUDIO)',
    })
    audioFile?: Promise<FileUpload>,
  ): Promise<Note> {
    return this.notesService.create(input, audioFile);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Mutation(() => Boolean, {
    name: 'deleteNote',
    description: 'Delete a note by ID',
  })
  deleteNote(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.notesService.remove(id);
  }
}
