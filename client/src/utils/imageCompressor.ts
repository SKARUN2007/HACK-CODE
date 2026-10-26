/**
 * Client-Side Image Compressor for Low Data / Low Bandwidth & Field Mobile Operations.
 * Converts uploaded photos to optimized WebP format (with graceful JPEG fallback)
 * to minimize bandwidth by ~40-60% while preserving sharp structural evidence.
 */

export async function compressImageToWebP(
  file: File,
  quality = 0.75,
  maxDimension = 1920
): Promise<File> {
  return new Promise((resolve) => {
    // If it's not an image (e.g. invalid type), return as-is
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale oversized images exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first
        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob && webpBlob.size > 0) {
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const webpFile = new File([webpBlob], `${baseName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(webpFile);
            } else {
              // Fallback to JPEG if WebP generation fails
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    const jpegFile = new File([jpegBlob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    resolve(jpegFile);
                  } else {
                    resolve(file);
                  }
                },
                'image/jpeg',
                quality
              );
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

/**
 * Backwards compatible alias for low data mode
 */
export async function compressImageForLowData(file: File, quality = 0.70): Promise<File> {
  return compressImageToWebP(file, quality, 1920);
}
