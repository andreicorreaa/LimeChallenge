export interface IStorageService {
  /**
   * Upload a file and return its accessible URL or path.
   * @param buffer - File content as a Buffer
   * @param filename - Original filename (used for extension detection)
   * @param mimetype - MIME type of the file
   * @returns URL or path to access the uploaded file
   */
  uploadFile(buffer: Buffer, filename: string, mimetype: string): Promise<string>;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
