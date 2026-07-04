import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { Note } from './entities/note.entity';
import { NotesResolver } from './notes.resolver';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), AiModule, StorageModule],
  providers: [NotesService, NotesResolver],
  exports: [NotesService],
})
export class NotesModule {}
