"use client";
import Image from "next/image";
import React from "react";

export function OptionButton({
  title,
  subtitle,
  imageSrc,
  disabled,
  onSelect,
  onDisabledClick,
}: {
  title: string;
  subtitle?: string;
  imageSrc: string;
  disabled?: boolean;
  onSelect?: () => void;
  onDisabledClick?: () => void;
}) {
  const handle = () => {
    if (disabled) return onDisabledClick?.();
    onSelect?.();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handle}
      className={`
        w-full overflow-hidden text-left rounded-2xl border
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md cursor-pointer"}
        border-neutral-200 bg-white shadow-sm transition
      `}
    >
      <div className="relative h-40">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="text-white text-lg font-semibold drop-shadow">{title}</div>
          {subtitle && (
            <div className="text-white/90 text-sm leading-snug">{subtitle}</div>
          )}
        </div>
      </div>
    </button>
  );
}
