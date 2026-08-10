// Cloudinary free-tier image hosting. Uses an "unsigned upload preset" —
// a Cloudinary setting that lets the browser upload directly to
// Cloudinary without our server touching the file at all. No backend
// upload handling needed, and it's free up to a generous monthly quota.
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Image upload failed.");
  }

  const data = await res.json();
  return data.secure_url as string;
}
