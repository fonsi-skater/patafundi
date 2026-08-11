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
    // Cloudinary returns a specific, useful reason in the response body
    // (e.g. "Upload preset not found", "Unsigned uploads are disabled")
    // — surface that instead of a generic message, so we can actually
    // see what's wrong without needing DevTools.
    let reason = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      reason = errBody?.error?.message ?? reason;
    } catch {
      // response wasn't JSON — fall back to the status code
    }
    throw new Error(`Cloudinary upload failed: ${reason}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}
