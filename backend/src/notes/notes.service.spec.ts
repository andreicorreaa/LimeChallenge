import { Readable } from 'node:stream';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { NoteInputType } from '../common/enums/note-input-type.enum';
import { NoteStatus } from '../common/enums/note-status.enum';
import { FileUpload } from '../common/types/file-upload.type';
import { STORAGE_SERVICE } from '../storage/interfaces/storage.interface';
import { Note } from './entities/note.entity';
import { NotesResolver } from './notes.resolver';
import { NotesService } from './notes.service';

// Mock the ESM graphql-upload to avoid syntax error in Jest's CommonJS env
jest.mock('graphql-upload/GraphQLUpload.mjs', () => {
  return {
    __esModule: true,
    default: 'GraphQLUpload',
  };
});

describe('NotesModule (Service & Resolver)', () => {
  let service: NotesService;
  let resolver: NotesResolver;
  let notesRepo: Repository<Note>;
  let aiService: AiService;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let storageService: any;

  const mockNoteId = '8f3e2db7-0a44-4860-84cf-2321287c88b0';
  const mockPatientId = '8f3e2db7-0a44-4860-84cf-2321287c88b9';

  const mockNote: Note = {
    id: mockNoteId,
    patientId: mockPatientId,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    patient: null as any,
    inputType: NoteInputType.TEXT,
    rawText: 'Patient is feeling fine.',
    status: NoteStatus.READY,
    soapSummary: 'Subjective: feeling fine',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let activeDbNote: Note;

  const mockRepo = {
    find: jest.fn().mockImplementation(() => Promise.resolve([activeDbNote])),
    findOne: jest.fn().mockImplementation((config) => {
      const id = config.where?.id;
      if (id === mockNoteId) return Promise.resolve(activeDbNote);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((dto) => ({ id: mockNoteId, ...dto })),
    save: jest.fn().mockImplementation((note) => {
      activeDbNote = { ...activeDbNote, ...note };
      return Promise.resolve(activeDbNote);
    }),
    remove: jest.fn().mockResolvedValue(true),
  };

  const mockAiService = {
    transcribeAudio: jest.fn().mockResolvedValue('Transcribed audio text'),
    generateSoapSummary: jest.fn().mockResolvedValue('Generated SOAP summary'),
  };

  const mockStorageService = {
    uploadFile: jest.fn().mockResolvedValue('/uploads/mock-audio.mp3'),
  };

  beforeEach(async () => {
    activeDbNote = { ...mockNote };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        NotesResolver,
        {
          provide: getRepositoryToken(Note),
          useValue: mockRepo,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: STORAGE_SERVICE,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    resolver = module.get<NotesResolver>(NotesResolver);
    notesRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    aiService = module.get<AiService>(AiService);
    storageService = module.get(STORAGE_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('NotesService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should find all notes', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockNote]);
      expect(notesRepo.find).toHaveBeenCalled();
    });

    it('should find one note by ID', async () => {
      const result = await service.findOne(mockNoteId);
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note does not exist', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });

    describe('create (TEXT note)', () => {
      it('should create and process a text note successfully', async () => {
        const dto = {
          patientId: mockPatientId,
          inputType: NoteInputType.TEXT,
          rawText: 'Patient text content',
        };

        const result = await service.create(dto);

        expect(notesRepo.create).toHaveBeenCalledWith({
          patientId: mockPatientId,
          inputType: NoteInputType.TEXT,
          rawText: 'Patient text content',
          status: NoteStatus.PROCESSING,
        });
        expect(mockAiService.generateSoapSummary).toHaveBeenCalledWith('Patient text content');
        expect(result.status).toBe(NoteStatus.READY);
        expect(result.soapSummary).toBe('Generated SOAP summary');
      });

      it('should throw BadRequestException if rawText is missing for TEXT type', async () => {
        const dto = {
          patientId: mockPatientId,
          inputType: NoteInputType.TEXT,
          rawText: '   ',
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      });
    });

    describe('create (AUDIO note)', () => {
      const createMockFileUpload = (): FileUpload => {
        const mockStream = new Readable();
        mockStream.push('audio file bytes');
        mockStream.push(null);
        return {
          filename: 'recording.mp3',
          mimetype: 'audio/mp3',
          encoding: '7bit',
          createReadStream: () => mockStream,
        };
      };

      it('should upload, transcribe, and generate SOAP summary for audio note', async () => {
        const dto = {
          patientId: mockPatientId,
          inputType: NoteInputType.AUDIO,
        };

        const result = await service.create(dto, Promise.resolve(createMockFileUpload()));

        expect(mockStorageService.uploadFile).toHaveBeenCalled();
        expect(mockAiService.transcribeAudio).toHaveBeenCalled();
        expect(mockAiService.generateSoapSummary).toHaveBeenCalledWith('Transcribed audio text');
        expect(result.status).toBe(NoteStatus.READY);
        expect(result.audioFilePath).toBe('/uploads/mock-audio.mp3');
        expect(result.transcribedText).toBe('Transcribed audio text');
        expect(result.soapSummary).toBe('Generated SOAP summary');
      });

      it('should mark note status as ERROR if AI processing fails', async () => {
        const dto = {
          patientId: mockPatientId,
          inputType: NoteInputType.AUDIO,
        };
        mockAiService.transcribeAudio.mockRejectedValueOnce(new Error('Gemini failed'));

        const result = await service.create(dto, Promise.resolve(createMockFileUpload()));

        expect(result.status).toBe(NoteStatus.ERROR);
      });

      it('should throw BadRequestException if audio file is missing for AUDIO type', async () => {
        const dto = {
          patientId: mockPatientId,
          inputType: NoteInputType.AUDIO,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      });
    });

    describe('remove', () => {
      it('should delete a note and return true', async () => {
        const result = await service.remove(mockNoteId);
        expect(result).toBe(true);
        expect(notesRepo.remove).toHaveBeenCalled();
      });
    });
  });

  describe('NotesResolver', () => {
    it('should query all notes', async () => {
      const result = await resolver.findAll();
      expect(result).toEqual([mockNote]);
    });

    it('should query one note by ID', async () => {
      const result = await resolver.findOne(mockNoteId);
      expect(result).toEqual(mockNote);
    });

    it('should mutate deleteNote successfully', async () => {
      const result = await resolver.deleteNote(mockNoteId);
      expect(result).toBe(true);
    });
  });
});
