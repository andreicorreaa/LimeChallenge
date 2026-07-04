import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { AiService } from '../ai/ai.service';
import { NoteInputType } from '../common/enums/note-input-type.enum';
import { NoteStatus } from '../common/enums/note-status.enum';
import { type FileUpload, streamToBuffer } from '../common/types/file-upload.type';
import { type IStorageService, STORAGE_SERVICE } from '../storage/interfaces/storage.interface';
import type { CreateNoteInput } from './dto/create-note.input';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectRepository(Note)
    private readonly notesRepo: Repository<Note>,

    private readonly aiService: AiService,

    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  findAll(): Promise<Note[]> {
    return this.notesRepo.find({
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepo.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!note) {
      throw new NotFoundException(`Note with id "${id}" not found`);
    }
    return note;
  }

  async create(input: CreateNoteInput, audioFile?: Promise<FileUpload>): Promise<Note> {
    // Validate: text notes need rawText, audio notes need audioFile
    if (input.inputType === NoteInputType.TEXT && !input.rawText?.trim()) {
      throw new BadRequestException('rawText is required for text input type');
    }
    if (input.inputType === NoteInputType.AUDIO && !audioFile) {
      throw new BadRequestException('audioFile is required for audio input type');
    }

    // Create initial note record with PROCESSING status
    const note = this.notesRepo.create({
      patientId: input.patientId,
      inputType: input.inputType,
      rawText: input.rawText,
      status: NoteStatus.PROCESSING,
    });
    const savedNote = await this.notesRepo.save(note);
    this.logger.log(`Note created (${savedNote.id}), starting AI processing...`);

    try {
      let textForSoap: string;

      if (input.inputType === NoteInputType.AUDIO && audioFile) {
        // 1. Buffer the upload stream
        const { createReadStream, filename, mimetype } = await audioFile;
        const buffer = await streamToBuffer(createReadStream());

        // 2. Upload to storage (local or S3)
        const audioFilePath = await this.storageService.uploadFile(buffer, filename, mimetype);
        savedNote.audioFilePath = audioFilePath;

        // 3. Transcribe with Gemini
        const transcribedText = await this.aiService.transcribeAudio(buffer, mimetype, filename);
        savedNote.transcribedText = transcribedText;
        textForSoap = transcribedText;
      } else {
        textForSoap = input.rawText ?? '';
      }

      // 4. Generate SOAP summary from the text
      const soapSummary = await this.aiService.generateSoapSummary(textForSoap);
      savedNote.soapSummary = soapSummary;
      savedNote.status = NoteStatus.READY;
    } catch (error) {
      this.logger.error(`AI processing failed for note ${savedNote.id}`, error);
      savedNote.status = NoteStatus.ERROR;
    }

    // 5. Save final state and return with patient relation
    const finalNote = await this.notesRepo.save(savedNote);
    return this.findOne(finalNote.id);
  }

  async remove(id: string): Promise<boolean> {
    const note = await this.findOne(id);
    await this.notesRepo.remove(note);
    this.logger.log(`Note deleted: ${id}`);
    return true;
  }
}
