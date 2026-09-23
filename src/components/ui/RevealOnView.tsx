"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function RevealOnView({
  children,
  className = "",
  delay = 0,
}: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasRevealed = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      hasRevealed.current = true;
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasRevealed.current) return;

        hasRevealed.current = true;
        setVisible(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`${className} transition-[opacity,transform] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
