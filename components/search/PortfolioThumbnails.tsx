"use client";

import { useState } from "react";

export default function PortfolioThumbnails({ images }: { images: string[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="flex gap-1.5 mt-3">
        {images.slice(0, 3).map((url) => (
          <img
            key={url}
            src={url}
            alt="Work sample"
            onClick={() => setLightboxUrl(url)}
            className="w-14 h-14 rounded object-cover border border-ink/10 cursor-pointer hover:opacity-80 transition-opacity"
          />
        ))}
      </div>

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-6 cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={lightboxUrl}
            alt="Enlarged work sample"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-card object-contain cursor-default"
          />
        </div>
      )}
    </>
  );
}
