import imageCompression from "browser-image-compression";

const MAX_WIDTH = 1600;

/** Natural size of an image file/blob, decoded in the browser. */
export async function imageSize(file: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/**
 * Compresses an image in the browser to WebP, at most 1600px wide, quality ~0.8.
 * Returns the blob and its final dimensions.
 */
export async function compressToWebp(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const original = await imageSize(file);
  // The library limits the LONGER side, so for portrait images scale the limit to keep width <= 1600.
  const scale = Math.min(1, MAX_WIDTH / original.width);
  const maxWidthOrHeight = Math.ceil(Math.max(original.width, original.height) * scale);

  const blob = await imageCompression(file, {
    fileType: "image/webp",
    initialQuality: 0.8,
    maxWidthOrHeight,
    maxSizeMB: 1.5,
    // The worker is loaded from a CDN by default; keep everything self-hosted.
    useWebWorker: false,
  });

  if (blob.type !== "image/webp") {
    throw new Error("WEBP_UNSUPPORTED");
  }

  const { width, height } = await imageSize(blob);
  return { blob, width, height };
}
