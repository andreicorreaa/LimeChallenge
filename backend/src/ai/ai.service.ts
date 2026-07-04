import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';
import { FileState, GoogleAIFileManager } from '@google/generative-ai/server';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly fileManager: GoogleAIFileManager;
  private readonly model;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  /**
   * Transcribe an audio buffer using the Gemini File API.
   * Writes a temp file, uploads to Gemini, waits for ACTIVE state,
   * then requests transcription.
   */
  async transcribeAudio(
    buffer: Buffer,
    mimetype: string,
    originalFilename: string,
  ): Promise<string> {
    const ext = path.extname(originalFilename) || '.audio';
    const tempPath = path.join(os.tmpdir(), `scribe-${Date.now()}${ext}`);

    try {
      // Write buffer to temp file
      fs.writeFileSync(tempPath, buffer);

      // Upload to Gemini File API
      this.logger.log(`Uploading audio to Gemini File API: ${originalFilename}`);
      const uploadResult = await this.fileManager.uploadFile(tempPath, {
        mimeType: mimetype,
        displayName: originalFilename,
      });

      let file = uploadResult.file;

      // Poll until the file is ready (state = ACTIVE)
      while (file.state === FileState.PROCESSING) {
        this.logger.log('Waiting for Gemini file processing...');
        await new Promise((r) => setTimeout(r, 2000));
        file = await this.fileManager.getFile(file.name);
      }

      if (file.state === FileState.FAILED) {
        throw new InternalServerErrorException('Gemini failed to process the audio file');
      }

      // Request transcription
      const result = await this.model.generateContent([
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
          },
        } as Part,
        'Please transcribe this audio recording accurately and completely. ' +
          'Return only the transcribed text, with no additional commentary or formatting.',
      ]);

      const transcription = result.response.text();
      this.logger.log('Transcription complete');
      return transcription;
    } catch (error) {
      console.error('TRANSCRIPTION EXCEPTION:', error);
      this.logger.error('Transcription failed', error);
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Failed to transcribe audio. Please try again.');
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  /**
   * Generate a SOAP-format clinical summary from a given text.
   */
  async generateSoapSummary(text: string): Promise<string> {
    const prompt = `You are a clinical documentation assistant. Convert the following clinical note into a structured SOAP format.

SOAP Format:
- **Subjective**: What the patient reports (symptoms, complaints, history)
- **Objective**: Observable findings, vitals, physical exam results
- **Assessment**: Clinical interpretation, diagnosis, or impression
- **Plan**: Treatment plan, next steps, follow-up

Clinical note:
${text}

Return the SOAP note in clean markdown format with the four sections clearly labeled. If information for a section is not present in the note, write "Not documented."`;

    try {
      this.logger.log('Generating SOAP summary with Gemini');
      const result = await this.model.generateContent(prompt);
      const summary = result.response.text();
      this.logger.log('SOAP summary generated');
      return summary;
    } catch (error) {
      console.error('SOAP GENERATION EXCEPTION:', error);
      this.logger.error('SOAP generation failed', error);
      throw new InternalServerErrorException('Failed to generate SOAP summary. Please try again.');
    }
  }
}
