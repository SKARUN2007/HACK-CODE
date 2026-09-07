import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { logSecurityEvent } from '../utils/securityLogger';

/**
 * Validates file binary header magic bytes to prevent executable/script uploads masked as images or audio.
 */
export function validateFileMagicBytes(filePath: string, mimeType: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;

    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const normMime = (mimeType || '').toLowerCase();

    // JPEG / JPG signature: FF D8 FF
    if (normMime.includes('jpeg') || normMime.includes('jpg') || normMime.includes('jfif')) {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    // PNG signature: 89 50 4E 47
    if (normMime.includes('png')) {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    }

    // WEBP signature: RIFF ... WEBP
    if (normMime.includes('webp')) {
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );
    }

    // Check by actual magic bytes for any image type
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true; // JPEG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true; // PNG
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return true; // RIFF / WebP / WAV

    // WAV audio signature: RIFF ... WAVE
    if (normMime.includes('wav')) {
      return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    }

    // WebM audio signature: 1A 45 DF A3
    if (normMime.includes('webm') || normMime.includes('ogg')) {
      return (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) || buffer[0] === 0x4f; // Ogg 'O'
    }

    // MP3 ID3 tag signature: 49 44 33 ("ID3") or FF FB / FF F3
    if (normMime.includes('mpeg') || normMime.includes('mp3')) {
      return (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
    }

    // Fallback: Ensure non-executable / non-script
    const headerStr = buffer.toString('utf8', 0, 4);
    return !headerStr.includes('#!') && !headerStr.includes('<?ph') && !headerStr.includes('MZ');
  } catch (err) {
    return false;
  }
}

/**
 * Middleware validating multer uploaded files for magic byte signatures.
 */
export function validateUploadsMiddleware(req: Request, res: Response, next: NextFunction) {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  if (!files) return next();

  const fileList: Express.Multer.File[] = [];
  Object.values(files).forEach((arr) => fileList.push(...arr));

  for (const file of fileList) {
    const isValid = validateFileMagicBytes(file.path, file.mimetype);
    if (!isValid) {
      logSecurityEvent({
        type: 'INVALID_UPLOAD',
        severity: 'HIGH',
        userId: (req as any).user?.id || null,
        endpoint: req.originalUrl,
        description: `Blocked unsafe file upload (${file.originalname}, MIME: ${file.mimetype}): Magic byte header signature check failed.`,
      });

      // Cleanup unsafe file
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch {
        // ignore
      }

      return res.status(400).json({
        error: 'Security Error: File upload rejected. File content header binary signature does not match declared MIME type.',
      });
    }
  }

  next();
}
