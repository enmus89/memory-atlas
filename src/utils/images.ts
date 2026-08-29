/**
 * Client-side image downscaling.
 *
 * Phone photos routinely arrive at 4000px and 3-5 MB. Uploading them as-is is
 * slow on mobile data and burns through object storage. Everything the app
 * displays is at most a full-screen lightbox, so 2048px on the long edge is
 * plenty and typically lands a photo somewhere around 300-600 KB.
 */

const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.85;

export interface CompressedImage {
  blob: Blob;
  extension: string;
  contentType: string;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = objectUrl;
  });
}

/**
 * Downscale and re-encode an image file. GIFs are passed through untouched
 * because drawing one to a canvas would flatten it to a single frame.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  if (file.type === 'image/gif') {
    return { blob: file, extension: 'gif', contentType: 'image/gif' };
  }

  const img = await loadImage(file);
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;

  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Very old or memory-starved browsers. Better to upload the original
    // than to lose the user's photo.
    return { blob: file, extension: 'jpg', contentType: file.type || 'image/jpeg' };
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );

  if (!blob) {
    return { blob: file, extension: 'jpg', contentType: file.type || 'image/jpeg' };
  }

  return { blob, extension: 'jpg', contentType: 'image/jpeg' };
}
