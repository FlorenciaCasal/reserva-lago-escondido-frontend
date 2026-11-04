"use client";

import React from "react";
import { X } from "lucide-react";

type Props = {
  message: string;
  onDismiss: () => void;
};

export default function AdminErrorNotification({ message, onDismiss }: Props) {
  React.useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed left-1/2 top-16 z-50 flex w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 items-start gap-3 rounded-xl border border-red-800 bg-red-950/95 p-4 text-sm text-red-200 shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl"
    >
      <p className="min-w-0 flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar mensaje de error"
        className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-200 transition hover:bg-red-900/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
