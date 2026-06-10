import { v2 as cloudinary } from "cloudinary";
export type { ImageOptimizeOptions } from "./cloudinaryUrl";

let isConfigured = false;

function ensureCloudinaryConfigured() {
  if (isConfigured) return;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials are not configured helper can not execute."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  isConfigured = true;
}

export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    // parts[1] looks like "v1716216121/folder/image_name.jpg" or "folder/image_name.png"
    const pathParts = parts[1].split("/");
    // If the first part matches "v" followed by numbers (version tag), remove it
    if (pathParts[0].match(/^v\d+$/)) {
      pathParts.shift();
    }
    const fileWithExtension = pathParts.join("/");
    const lastDotIdx = fileWithExtension.lastIndexOf(".");
    if (lastDotIdx === -1) return fileWithExtension;
    return fileWithExtension.substring(0, lastDotIdx);
  } catch (err) {
    console.error("Failed to parse Cloudinary URL for deletion:", err);
    return null;
  }
}

export async function uploadToCloudinary(
  base64String: string,
  folderName = "Arooj_letoile"
): Promise<string> {
  ensureCloudinaryConfigured();

  const res = await cloudinary.uploader.upload(base64String, {
    folder: folderName,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "auto",
    transformation: [
      {
        quality: "auto:good",
        fetch_format: "auto",
        flags: "progressive",
      },
      {
        width: 2000,
        height: 2000,
        crop: "limit",
        quality: "auto:good",
      },
    ],
  });

  return res.secure_url;
}

/**
 * Deletes an image from Cloudinary based on its URL.
 */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return false;

  ensureCloudinaryConfigured();
  const res = await cloudinary.uploader.destroy(publicId);
  return res.result === "ok";
}
