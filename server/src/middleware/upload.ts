import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types whitelist
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/x-m4a',
  'audio/m4a',
  'audio/mp4',
  'audio/aac',
];

// Configure Disk Storage with sanitized random UUID filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const randomName = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase() || getExtensionFromMime(file.mimetype);
    // Sanitize extension to prevent extension spoofing / path traversal
    const safeExt = ext.replace(/[^a-z0-9.]/gi, '');
    cb(null, `${randomName}${safeExt}`);
  },
});

function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'audio/mpeg':
    case 'audio/mp3':
      return '.mp3';
    case 'audio/wav':
      return '.wav';
    case 'audio/webm':
      return '.webm';
    case 'audio/ogg':
      return '.ogg';
    case 'audio/x-m4a':
    case 'audio/m4a':
    case 'audio/mp4':
      return '.m4a';
    default:
      return '.bin';
  }
}

// Multer filter callback
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isPhoto = file.fieldname === 'photo' && ALLOWED_PHOTO_TYPES.includes(file.mimetype);
  const isAudio = file.fieldname === 'voice' && ALLOWED_AUDIO_TYPES.includes(file.mimetype);

  if (isPhoto || isAudio) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file format for field '${file.fieldname}'. MIME type '${file.mimetype}' is not permitted.`
      )
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Max 15MB total per file
  },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'voice', maxCount: 1 },
]);
