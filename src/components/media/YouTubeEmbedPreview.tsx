"use client";

import React from "react";
import { Play } from "lucide-react";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, parseYouTubeVideoId } from "@/lib/youtube";

type Props = {
  url: string;
  title: string;
  className?: string;
};

export default function YouTubeEmbedPreview({ url, title, className = "" }: Props) {
  const videoId = parseYouTubeVideoId(url);
  const [playing, setPlaying] = React.useState(false);

  if (!videoId) return null;

  const embedUrl = getYouTubeEmbedUrl(videoId);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId);

  return (
    <div className={`relative bg-neutral-950 ${className}`}>
      {playing ? (
        <iframe
          src={`${embedUrl}?rel=0&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative h-full w-full"
          aria-label="Reproducir video"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover opacity-90" />
          <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />
          <span className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg transition group-hover:scale-105">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
