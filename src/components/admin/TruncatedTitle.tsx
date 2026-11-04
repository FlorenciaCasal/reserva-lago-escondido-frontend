"use client";

import React from "react";

type TruncatedTitleProps = {
  children: string;
  className?: string;
};

export default function TruncatedTitle({ children, className = "" }: TruncatedTitleProps) {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    const checkOverflow = () => {
      setIsTruncated(node.scrollWidth > node.clientWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [children]);

  return (
    <span className="group relative block min-w-0">
      <span
        ref={textRef}
        tabIndex={isTruncated ? 0 : undefined}
        className={`block truncate outline-none ${className}`}
      >
        {children}
      </span>
      {isTruncated && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-30 mt-2 max-w-[min(80vw,22rem)] rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-medium leading-relaxed text-neutral-100 opacity-0 shadow-2xl shadow-black/50 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {children}
        </span>
      )}
    </span>
  );
}
