"use client";

import React, { useState, useRef } from "react";
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, Loader2, Star } from "lucide-react";
import { uploadImageAction } from "../actions/media.actions";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages: number;
  label?: string;
}

export function ImageUpload({ images, onChange, maxImages, label }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side canvas compression to optimize and compress imagery beforehand
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Quality is optimized at 80% compression
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.81);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Unable to load image for optimization."));
      };
      reader.onerror = () => reject(new Error("Unable to read local file."));
    });
  };

  const handleFiles = async (files: FileList) => {
    const acceptedFiles = Array.from(files).filter((file) =>
      file.type.match(/image\/(jpeg|png|webp|jpg)/)
    );

    if (acceptedFiles.length === 0) {
      setUploadError("Please provide valid image files (JPG, PNG, or WEBP).");
      return;
    }

    // Check sizes - enforce individual file maximum size of 5MB
    for (const file of acceptedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }
    }

    if (images.length + acceptedFiles.length > maxImages) {
      setUploadError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of acceptedFiles) {
        // Step 1: Compress on the client-side
        const base64Str = await compressImage(file);

        // Step 2: Upload via admin-level secure server action
        const res = await uploadImageAction(base64Str);
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        } else {
          throw new Error(res.error || "Upload action rejection.");
        }
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred during Cloudinary upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Reordering functions (move left / right) - tactile, robust, iframe-safe ordering
  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };

  const deleteImage = (index: number) => {
    const newImages = images.filter((_, idx) => idx !== index);
    onChange(newImages);
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const item = newImages.splice(index, 1)[0];
    newImages.unshift(item); // Move to priority position
    onChange(newImages);
  };

  return (
    <div className="space-y-3.5 text-left">
      {label && (
        <label className="block text-[10px] font-display font-semibold uppercase tracking-widest text-[#555]">
          {label} {maxImages > 1 && `(Up to ${maxImages} images, first is primary)`}
        </label>
      )}

      {/* Drag & Drop zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
            isDragging
              ? "border-gold-550 bg-gold-50/30 scale-[0.99]"
              : "border-gold-200 bg-white hover:border-gold-450 hover:bg-neutral-50/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple={maxImages > 1}
            accept="image/*"
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-2 flex flex-col items-center">
              <Loader2 className="h-7 w-7 animate-spin text-gold-600" />
              <p className="text-xs font-sans text-neutral-500 font-medium">
                Optimizing and transferring with Cloudinary...
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 flex flex-col items-center">
              <div className="p-2.5 bg-[#faf9f6] rounded-full text-gold-700">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-sans text-neutral-600 font-medium leading-relaxed">
                Drag & drop or <span className="text-gold-700 font-bold underline">browse local files</span>
              </p>
              <p className="text-[10px] font-mono text-neutral-400">
                Formats: JPG, PNG, WEBP — Max 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Output */}
      {uploadError && (
        <p className="text-xs font-sans font-bold text-red-650 flex items-center space-x-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
          <span>{uploadError}</span>
        </p>
      )}

      {/* Uploaded Previews (Tactile list) */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {images.map((url, idx) => (
            <div
              key={idx + url}
              className="relative group rounded-xl overflow-hidden border border-gold-150 bg-white shadow-xs h-32 flex flex-col justify-between"
            >
              <img
                src={url}
                alt={`Uploaded image ${idx + 1}`}
                className="w-full h-22 object-cover"
              />

              {/* Badges/Indicators */}
              <div className="absolute top-1.5 left-1.5 flex items-center bg-black/70 text-[9px] font-display font-semibold uppercase tracking-wider text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                {idx === 0 ? (
                  <span className="flex items-center text-gold-400 font-extrabold">
                    <Star className="h-2.5 w-2.5 fill-gold-400 mr-0.5" /> PRIMARY
                  </span>
                ) : (
                  <span>#{idx + 1}</span>
                )}
              </div>

              {/* Action Buttons Overlay / Footer Controls */}
              <div className="h-10 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around px-1 text-white select-none">
                <button
                  type="button"
                  onClick={() => moveImage(idx, "left")}
                  disabled={idx === 0}
                  className="p-1 hover:text-gold-300 disabled:opacity-30 disabled:hover:text-white transition-colors"
                  title="Move left"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>

                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="p-1 text-neutral-400 hover:text-gold-300 transition-colors"
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => moveImage(idx, "right")}
                  disabled={idx === images.length - 1}
                  className="p-1 hover:text-gold-300 disabled:opacity-30 disabled:hover:text-white transition-colors"
                  title="Move right"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteImage(idx)}
                  className="p-1 hover:text-red-400 text-neutral-300 transition-colors"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
