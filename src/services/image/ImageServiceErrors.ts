// Error classes for image service

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export class UploadUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadUrlError';
  }
}
