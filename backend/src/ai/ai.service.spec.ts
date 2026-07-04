import * as fs from 'node:fs';
import { FileState } from '@google/generative-ai/server';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

// Mock the external Google Gen AI SDK modules
const mockGenerateContent = jest.fn();
const mockUploadFile = jest.fn();
const mockGetFile = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

jest.mock('@google/generative-ai/server', () => {
  return {
    GoogleAIFileManager: jest.fn().mockImplementation(() => ({
      uploadFile: mockUploadFile,
      getFile: mockGetFile,
    })),
    FileState: {
      PROCESSING: 'PROCESSING',
      ACTIVE: 'ACTIVE',
      FAILED: 'FAILED',
    },
  };
});

describe('AiService', () => {
  let service: AiService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transcribeAudio', () => {
    const mockBuffer = Buffer.from('mock-audio-content');
    const mockMimeType = 'audio/mp3';
    const mockFilename = 'test.mp3';

    it('should successfully transcribe audio', async () => {
      // Mock File Manager responses
      mockUploadFile.mockResolvedValue({
        file: {
          name: 'files/mock-file-123',
          state: FileState.PROCESSING,
          mimeType: mockMimeType,
          uri: 'https://gemini/mock-uri',
        },
      });

      mockGetFile.mockResolvedValue({
        name: 'files/mock-file-123',
        state: FileState.ACTIVE,
        mimeType: mockMimeType,
        uri: 'https://gemini/mock-uri',
      });

      // Mock model text response
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'This is the transcribed text of the audio recording.',
        },
      });

      // Spy on fs methods to verify cleanup
      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = await service.transcribeAudio(mockBuffer, mockMimeType, mockFilename);

      expect(result).toBe('This is the transcribed text of the audio recording.');
      expect(mockUploadFile).toHaveBeenCalled();
      expect(mockGetFile).toHaveBeenCalledWith('files/mock-file-123');
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(unlinkSpy).toHaveBeenCalled();

      writeSpy.mockRestore();
      unlinkSpy.mockRestore();
      existsSpy.mockRestore();
    });

    it('should throw InternalServerErrorException if Gemini file processing fails', async () => {
      mockUploadFile.mockResolvedValue({
        file: {
          name: 'files/mock-file-fail',
          state: FileState.PROCESSING,
          mimeType: mockMimeType,
          uri: 'https://gemini/mock-uri-fail',
        },
      });

      mockGetFile.mockResolvedValue({
        name: 'files/mock-file-fail',
        state: FileState.FAILED,
        mimeType: mockMimeType,
        uri: 'https://gemini/mock-uri-fail',
      });

      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      await expect(service.transcribeAudio(mockBuffer, mockMimeType, mockFilename)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(unlinkSpy).toHaveBeenCalled();

      writeSpy.mockRestore();
      unlinkSpy.mockRestore();
      existsSpy.mockRestore();
    });
  });

  describe('generateSoapSummary', () => {
    it('should generate a SOAP summary successfully', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Mocked SOAP note markdown',
        },
      });

      const result = await service.generateSoapSummary('Patient complains of headache');

      expect(result).toBe('Mocked SOAP note markdown');
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('SOAP Format'));
    });

    it('should throw InternalServerErrorException if generation fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(service.generateSoapSummary('Any text')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
