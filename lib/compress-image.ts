import imageCompression from "browser-image-compression";

const DEFAULT_MAX_WIDTH = 1600;

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  type: "image/webp" | "image/jpeg";
  ext: "webp" | "jpg";
};

/** Natural size of an image file/blob, decoded in the browser. */
export async function imageSize(file: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/**
 * Compresses an image in the browser, at most `maxWidth` px wide (default 1600), quality ~0.8.
 * WebP when the browser can encode it; otherwise JPEG (Safari and every browser on iPhone/iPad
 * cannot encode WebP). Returns the blob, its type and its final dimensions.
 */
export async function compressImage(file: File, maxWidth = DEFAULT_MAX_WIDTH): Promise<CompressedImage> {
  const original = await imageSize(file);
  // The library limits the LONGER side, so for portrait images scale the limit to keep width <= maxWidth.
  const scale = Math.min(1, maxWidth / original.width);
  const maxWidthOrHeight = Math.ceil(Math.max(original.width, original.height) * scale);

  const compress = (fileType: "image/webp" | "image/jpeg") =>
    imageCompression(file, {
      fileType,
      initialQuality: 0.8,
      maxWidthOrHeight,
      maxSizeMB: 1.5,
      // The worker is loaded from a CDN by default; keep everything self-hosted.
      useWebWorker: false,
    });

  let blob = await compress("image/webp");
  let type: CompressedImage["type"] = "image/webp";
  if (blob.type !== "image/webp") {
    blob = await compress("image/jpeg");
    type = "image/jpeg";
    if (blob.type !== "image/jpeg") throw new Error("ENCODE_UNSUPPORTED");
  }

  const { width, height } = await imageSize(blob);
  return { blob, width, height, type, ext: type === "image/webp" ? "webp" : "jpg" };
}
